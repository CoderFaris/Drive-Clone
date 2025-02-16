import DriveContents from './drive-contents'
import { QUERIES } from "~/server/db/queries";

export default async function GoogleDriveClone(props: {
    params: Promise<{folderId: string}>
}) {

  const params = await props.params
  
  const parsedFolderId = parseInt(params.folderId)

  if (isNaN(parsedFolderId)) {
    return <div>Invalid folder ID</div>
  }



  const filesPromise = QUERIES.getFiles(parsedFolderId)
  const foldersPromise = QUERIES.getFolders(parsedFolderId)

  const parentsPromise = QUERIES.getAllParentsForFolder(parsedFolderId)

  const [folders, files, parents] = await Promise.all([foldersPromise, filesPromise, parentsPromise])

  return <DriveContents files={files} folders={folders} parents={parents} currentFolderId={parsedFolderId}/>

}