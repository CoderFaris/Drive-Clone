import "server-only"

import { db } from "~/server/db"
import { files_table as filesSchema, folders_table as foldersSchema } from "~/server/db/schema"
import { eq, and, isNull } from "drizzle-orm"
import { root } from ".eslintrc.cjs"

export const QUERIES = {
    getFiles : function(folderId: number) {

        return db.select().from(filesSchema).where(eq(filesSchema.parent, folderId)).orderBy(filesSchema.id)
    
    },

    getFolders : function(folderId: number) {
    
        return db.select().from(foldersSchema).where(eq(foldersSchema.parent, folderId)).orderBy(foldersSchema.id)
        
    },

    getAllParentsForFolder: async function(folderId : number) {
        const parents = [];
        let currentId: number | null = folderId;
        const visited = new Set<number>();
    
        while (currentId !== null) {
            if (visited.has(currentId)) {
                throw new Error("Circular reference detected in folder structure");
            }
            visited.add(currentId);
    
            const folder = await db
            .select()
            .from(foldersSchema)
            .where(eq(foldersSchema.id, currentId));
    
            if (!folder[0]) {
                continue
            }
            parents.unshift(folder[0]);
            currentId = folder[0]?.parent;
        }
        return parents;
    },

    getFolderById : async function(folderId: number) {
        const folder = await db
            .select()
            .from(foldersSchema)
            .where(eq(foldersSchema.id, folderId))
        return folder[0]
    },

    getRootFolderForUser : async function (userId : string) {
        const folder = await db
            .select()
            .from(foldersSchema)
            .where(and(eq(foldersSchema.ownerId, userId), isNull(foldersSchema.parent)))
        return folder[0]
    }


}

export const MUTATIONS = {
    createFile : async function(input: {file : {
        name: string;
        size: number;
        url: string;
        parent: number;
     },
        userId: string;
    }) {
        return await db.insert(filesSchema).values({
            ...input.file,
            ownerId: input.userId,
        })

    },

    onboardUser : async function(userId : string) {
        const rootFolder = await db.insert(foldersSchema).values({
            name: "Root",
            parent: null,
            ownerId: userId,
        }).$returningId()

        const rootFolderId = rootFolder[0]!.id

        await db.insert(foldersSchema).values([{
            name: "Trash",
            parent: rootFolderId,
            ownerId: userId
        },
        {
            name: "Shared",
            parent: rootFolderId,
            ownerId: userId,
        },
        {
            name: "Documents",
            parent: rootFolderId,
            ownerId: userId,
        }
        ])

        return rootFolderId
    }
}






  


