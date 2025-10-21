"use server";

import { currentUser, EmailAddress } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export default async function syncUser() {
    try {
        const userId = await auth();    
        const user = await currentUser();
        if (!user || !userId) return;

        const existingUser = await prisma.user.findUnique({
            where: {
                clerkId: user.id,
            },
        });

        if (existingUser) return;   

        const bdUser = await prisma.user.create({
            data: {
                clerkId: user.id,
                email: user.emailAddresses[0].emailAddress,
                name: `${user.firstName || ""} ${user.lastName || ""}`,
                image: user.imageUrl,
                username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
            }
        });

        return bdUser;
    } catch (error) {
        console.error("Error syncing user", error);
    }
}
