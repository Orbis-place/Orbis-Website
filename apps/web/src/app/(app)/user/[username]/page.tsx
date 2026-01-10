"use client";

import { useParams, redirect } from 'next/navigation';

export default function UserRootPage() {
    const params = useParams();
    const username = params.username as string;

    redirect(`/user/${username}/resources`);
}
