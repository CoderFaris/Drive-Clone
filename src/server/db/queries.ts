import "server-only"

import { db } from "~/server/db"
import { files_table as filesSchema, folders_table as foldersSchema } from "~/server/db/schema"
import { eq } from "drizzle-orm"

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

    }
}






  


