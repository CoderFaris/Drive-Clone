import { auth } from "@clerk/nextjs/server"
import { QUERIES } from "~/server/db/queries"
import { redirect } from "next/navigation"

export default async function DrivePage() {

    const session = await auth()

    if (!session.userId) {
        return redirect("/sign-in")
    }

    const rootFolder = await QUERIES.getRootFolderForUser(session.userId)

    if (!rootFolder) {
        return redirect("/drive/create-root-folder")
    }

    return redirect(`/f/${rootFolder.id}`)
}