"use server";

import { and, eq, inArray } from "drizzle-orm";
import { db } from "./db";
import { files_table, folders_table } from "./db/schema";
import { auth } from "@clerk/nextjs/server";
import { UTApi } from "uploadthing/server";
import { cookies } from "next/headers";
import { MUTATIONS } from "./db/queries";

const utApi = new UTApi()

export async function createFolder(nname:string, folderId:number, uuserId:string) {
    const res = await MUTATIONS.createFolder({ folder : {name : nname, parent: folderId}, userId : uuserId})
    const res2 = JSON.stringify(res)
    
    const c = await cookies()

    c.set("force-refresh", JSON.stringify(Math.random()))
    return res2
}

export async function deleteFile(fileId : number) {
    const session = await auth()

    if(!session.userId) {
        return {error: "Unauthorized"}
    }

    const [file] = await db.select().from(files_table).where(and(eq(files_table.id, fileId), eq(files_table.ownerId, session.userId)))

    if(!file) {
        return {error: "File not found"}
    }

    const utapiResult = await utApi.deleteFiles([file.url.replace('https://o6lauiq7z3.ufs.sh/f/', "")])

    console.log(utapiResult)

    const dbDeleteresult = await db.delete(files_table).where(eq(files_table.id, fileId))

    console.log(dbDeleteresult)

    const c = await cookies()

    c.set("force-refresh", JSON.stringify(Math.random()))

    return {success : "true"}
}

export async function deleteFolder(folderId: number) {
    const session = await auth();

    if (!session?.userId) {
        return { error: "Unauthorized" };
    }

    
    const [folder] = await db
        .select()
        .from(folders_table)
        .where(and(eq(folders_table.id, folderId), eq(folders_table.ownerId, session.userId)));

    if (!folder) {
        return { error: "Folder not found" };
    }

    
    const { filesToDelete, foldersToDelete } = await collectFolderContents(folderId, session.userId);

    
    if (filesToDelete.length > 0) {
        await db
            .delete(files_table)
            .where(
                and(
                    eq(files_table.ownerId, session.userId),
                    inArray(files_table.url, filesToDelete)
                )
            );
    }

    

    for(const file of filesToDelete) {
        await utApi.deleteFiles([file.replace('https://o6lauiq7z3.ufs.sh/f/', "")]) // delete files from uploadthing (url)
    }

    
    if (foldersToDelete.length > 0) {
        await db
            .delete(folders_table)
            .where(
                and(
                    eq(folders_table.ownerId, session.userId),
                    inArray(folders_table.id, foldersToDelete)
                )
            );
    }


    const c = await cookies()

    c.set("force-refresh", JSON.stringify(Math.random()))

    return { success: true };
}


async function collectFolderContents(
    folderId: number,
    userId: string
): Promise<{ filesToDelete: string[]; foldersToDelete: number[] }> {
    const filesToDelete: string[] = [];
    const foldersToDelete: number[] = [];

    const files = await db
        .select()
        .from(files_table)
        .where(and(eq(files_table.parent, folderId), eq(files_table.ownerId, userId)));

    filesToDelete.push(...files.map((file) => file.url));

    
    const subfolders = await db
        .select()
        .from(folders_table)
        .where(and(eq(folders_table.parent, folderId), eq(folders_table.ownerId, userId)));

    
    for (const subfolder of subfolders) {
        const { filesToDelete: subFiles, foldersToDelete: subFolders } = await collectFolderContents(
            subfolder.id,
            userId
        );
        filesToDelete.push(...subFiles);
        foldersToDelete.push(...subFolders);
    }

    
    foldersToDelete.push(folderId); // current folder

    return { filesToDelete, foldersToDelete };
}