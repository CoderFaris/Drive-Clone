import { db } from "~/server/db"
import { files as filesSchema, folders as foldersSchema } from "~/server/db/schema"
import DriveContents from '../../drive-contents'
import { eq } from "drizzle-orm"

async function getAllParents(folderId : number) {
    const parents = [];
    let currentId: number | null = folderId;
    const visited = new Set<number>(); // Track visited folder IDs

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

export default async function GoogleDriveClone(props: {
    params: Promise<{folderId: string}>
}) {

  const params = await props.params
  
  const parsedFolderId = parseInt(params.folderId)

  if (isNaN(parsedFolderId)) {
    return <div>Invalid folder ID</div>
  }



  const filesPromise = db.select().from(filesSchema).where(eq(filesSchema.parent, parsedFolderId))
  const foldersPromise = db.select().from(foldersSchema).where(eq(foldersSchema.parent, parsedFolderId))

  const parentsPromise = getAllParents(parsedFolderId)

  const [folders, files, parents] = await Promise.all([foldersPromise, filesPromise, parentsPromise])

  return <DriveContents files={files} folders={folders} parents={parents}/>

}