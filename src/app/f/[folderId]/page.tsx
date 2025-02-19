import { auth } from '@clerk/nextjs/server';
import DriveContents from './drive-contents'
import { QUERIES } from "~/server/db/queries";
import { redirect } from 'next/navigation';

export default async function GoogleDriveClone(props: {
    params: Promise<{folderId: string}>
}) {

  const params = await props.params
  
  const parsedFolderId = parseInt(params.folderId)

  const user = await auth()

  if (!user.userId) {
    return redirect("/sign-in")
  }

  if (isNaN(parsedFolderId)) {
    return <div>Invalid folder ID</div>
  }

  const folder = await QUERIES.getFolderById(parsedFolderId)

  if(!folder) {
    return <div>Create new folder</div>
  }

  if (folder.ownerId !== user.userId) {
    return redirect('/drive');
  }

  const filesPromise = QUERIES.getFiles(parsedFolderId)
  const foldersPromise = QUERIES.getFolders(parsedFolderId)

  const parentsPromise = QUERIES.getAllParentsForFolder(parsedFolderId)

  const [folders, files, parents] = await Promise.all([foldersPromise, filesPromise, parentsPromise])

  return <DriveContents files={files} folders={folders} parents={parents} currentFolderId={parsedFolderId} currUser={user.userId}/>

}