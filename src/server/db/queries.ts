import "server-only"

import { db } from "~/server/db"
import { files_table as filesSchema, folders_table as foldersSchema } from "~/server/db/schema"
import { eq } from "drizzle-orm"

export const QUERIES = {
    getFiles : function(folderId: number) {

        return db.select().from(filesSchema).where(eq(filesSchema.parent, folderId))
    
    },

    getFolders : function(folderId: number) {
    
        return db.select().from(foldersSchema).where(eq(foldersSchema.parent, folderId))
        
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
    }


}

export const MUTATIONS = {
    createFile : async function(input: {file : {
        name: string;
        size: number;
        url: string;
     },
        userId: string;
    }) {
        return await db.insert(filesSchema).values({
            ...input.file,
            parent: 1,
        })

    }
}






  


