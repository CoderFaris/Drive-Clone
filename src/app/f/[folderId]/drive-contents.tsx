"use client"

import { ChevronRight } from "lucide-react"
import { FileRow, FolderRow } from "./file-row"
import type { files_table, folders_table } from "~/server/db/schema"
import Link from "next/link"
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { UploadButton } from "~/components/uploadthing"
import { useRouter } from "next/navigation" // this one is for app router, next/router is for pages
import { Button } from "~/components/ui/button"
import { createFolder } from "~/server/actions";

export default function DriveContents(props:{
  files: typeof files_table.$inferSelect[];
  folders: typeof folders_table.$inferSelect[];
  parents: typeof folders_table.$inferSelect[];
  currentFolderId: number;
  currUser : string
}) {
  
  const navigate = useRouter();
  
  const handleCreateFolder = async () => {
    const folderName = prompt('Enter a name for the folder:');
    if (folderName) {
      try {
        const result = await createFolder(folderName, props.currentFolderId, props.currUser)
        console.log(result)
      } catch (error) {
        console.error('Error creating folder:', error);
     }
    }
    
  }
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Link
              href="/f/1"
              className="text-gray-300 hover:text-white mr-2"
            >
              My Drive
            </Link>
            {props.parents.map((folder) => (
              <div key={folder.id} className="flex items-center">
                <ChevronRight className="mx-2 text-gray-500" size={16} />
                <Link
                  href={`/f/${folder.id}`}
                  className="text-gray-300 hover:text-white"
                >
                  {folder.name}
                </Link>
              </div>
            ))}
          </div>
          <div>
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-xl">
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400">
              <div className="col-span-6">Name</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-3">Size</div>
              <div className="col-span-1"></div>
            </div>
          </div>
          <ul>
            {props.folders.map((folder) => (
              <FolderRow key={folder.id} folder={folder} />
            ))}
            {props.files.map((file) => (
              <FileRow key={file.id} file={file}></FileRow>
            ))}
          </ul>
        </div>
        
        <UploadButton endpoint="driveUploader" onClientUploadComplete={()=>{
          navigate.refresh()
          
        }} input={{folderId: props.currentFolderId}}></UploadButton>
        <Button variant={"secondary"} onClick={handleCreateFolder} aria-label="Create folder">Create Folder</Button>
      </div>
    </div>
  )
}

