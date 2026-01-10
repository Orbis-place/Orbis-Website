'use client'
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { authClient } from "@repo/auth/client";
import { useSessionStore } from "@/stores/useSessionStore";
import { Session } from '@repo/auth';
import * as React from "react";

const marketplaceCategories = [
    { name: 'Mods', href: '/mods', icon: 'mdi:puzzle', description: 'New gameplay mechanics & items' },
    { name: 'Modpacks', href: '/modpacks', icon: 'mdi:package-variant', description: 'Complete curated game experiences' },
    { name: 'Worlds', href: '/worlds', icon: 'mdi:earth', description: 'Custom maps, lobbies & spawns' },
    { name: 'Plugins', href: '/plugins', icon: 'mdi:power-plug', description: 'Server management & features' },
    { name: 'Asset Packs', href: '/asset-packs', icon: 'mdi:image-multiple', description: '3D models, textures & sounds' },
    { name: 'Prefabs', href: '/prefabs', icon: 'mdi:cube-outline', description: 'Ready-to-use structures & builds' },
    { name: 'Data packs', href: '/data-packs', icon: 'mdi:database', description: 'Vanilla game modifications' },
    { name: 'Tools & Scripts', href: '/tools-scripts', icon: 'mdi:tools', description: 'External utilities & automation' },
];

interface NavbarProps {
    session: Session | null;
}

export default function Navbar({ session }: NavbarProps) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [mobileProfileOpen, setMobileProfileOpen] = useState(false);

    useEffect(() => {
        if (mobileNavOpen || mobileProfileOpen) {
            // Prevent scrolling on both html and body (mobile Safari compatible)
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            // Restore scrolling
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }

        return () => {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [mobileNavOpen, mobileProfileOpen]);

    const handleSignOut = async () => {
        await authClient.signOut();
        setMobileProfileOpen(false);
        // Redirect to home and refresh to ensure complete logout
        window.location.href = '/';
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const closeMobileNav = () => setMobileNavOpen(false);
    const closeMobileProfile = () => setMobileProfileOpen(false);

    return (
        <>
            {/* Desktop Navbar */}
            <nav className="hidden lg:flex w-full z-50 h-25 relative justify-center px-8">
                <div className="flex max-w-6xl justify-between w-full items-center gap-2">
                    <Link href="/">
                        <Image
                            src="/navbar_header.png"
                            alt="Orbis Logo"
                            width={139}
                            height={48.18}
                            priority
                        />
                    </Link>

                    <div className="flex items-center gap-8 font-hebden text-base text-foreground">
                        {/* Discover Navigation Menu */}
                        <NavigationMenu delayDuration={50}>
                            <NavigationMenuList>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger
                                        onClick={(e) => {
                                            e.preventDefault();
                                        }}
                                        className="font-hebden font-semibold text-base leading-none bg-transparent text-foreground hover:text-foreground">
                                        Discover
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent className="bg-accent border border-border rounded-[25px] p-3">
                                        <ul className="grid w-[320px] gap-2">
                                            <li>
                                                <NavigationMenuLink
                                                    href="/resources"
                                                    className="flex flex-row items-center gap-2 select-none rounded-lg p-2 leading-none no-underline outline-none transition-colors hover:bg-white/5 hover:text-foreground focus:bg-white/5 focus:text-foreground"
                                                >
                                                    <div className="p-1.5 rounded-lg bg-[#109EB1]/10 text-[#109EB1]">
                                                        <Icon icon="mdi:compass" width="18" height="18" />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-hebden font-semibold text-foreground text-sm">Resources</span>
                                                        <span className="font-nunito text-xs text-foreground/60">Browse mods, plugins, and more</span>
                                                    </div>
                                                </NavigationMenuLink>
                                            </li>
                                            <li>
                                                <NavigationMenuLink
                                                    href="/servers"
                                                    className="flex flex-row items-center gap-2 select-none rounded-lg p-2 leading-none no-underline outline-none transition-colors hover:bg-white/5 hover:text-foreground focus:bg-white/5 focus:text-foreground"
                                                >
                                                    <div className="p-1.5 rounded-lg bg-[#109EB1]/10 text-[#109EB1]">
                                                        <Icon icon="mdi:server" width="16" height="16" />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-hebden font-semibold text-foreground text-sm">Find Servers</span>
                                                        <span className="font-nunito text-xs text-foreground/60">Join active multiplayer communities</span>
                                                    </div>
                                                </NavigationMenuLink>
                                            </li>
                                            <li>
                                                <NavigationMenuLink
                                                    href="/creators"
                                                    className="flex flex-row items-center gap-2 select-none rounded-lg p-2 leading-none no-underline outline-none transition-colors hover:bg-white/5 hover:text-foreground focus:bg-white/5 focus:text-foreground"
                                                >
                                                    <div className="p-1.5 rounded-lg bg-[#109EB1]/10 text-[#109EB1]">
                                                        <Icon icon="mdi:account-group" width="16" height="16" />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-hebden font-semibold text-foreground text-sm">Creators</span>
                                                        <span className="font-nunito text-xs text-foreground/60">Support & follow top developers</span>
                                                    </div>
                                                </NavigationMenuLink>
                                            </li>
                                            <li>
                                                <NavigationMenuLink
                                                    href="/showcase"
                                                    className="flex flex-row items-center gap-2 select-none rounded-lg p-2 leading-none no-underline outline-none transition-colors hover:bg-white/5 hover:text-foreground focus:bg-white/5 focus:text-foreground"
                                                >
                                                    <div className="p-1.5 rounded-lg bg-[#109EB1]/10 text-[#109EB1]">
                                                        <Icon icon="mdi:image-multiple" width="16" height="16" />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-hebden font-semibold text-foreground text-sm">Showcase</span>
                                                        <span className="font-nunito text-xs text-foreground/60">Community gallery & WIP projects</span>
                                                    </div>
                                                </NavigationMenuLink>
                                            </li>
                                        </ul>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>

                        {/* Marketplace Navigation Menu */}
                        <NavigationMenu delayDuration={50}>
                            <NavigationMenuList>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger
                                        onClick={(e) => {
                                            e.preventDefault();
                                        }}
                                        className="font-hebden font-semibold text-base leading-none bg-transparent text-foreground hover:text-foreground">
                                        Marketplace
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent className="bg-accent border border-border rounded-[25px] p-3">
                                        <ul className="grid w-[480px] grid-cols-2 gap-2">
                                            {marketplaceCategories.map((category) => (
                                                <li key={category.href}>
                                                    <NavigationMenuLink
                                                        href={category.href}
                                                        className="flex flex-row items-start gap-2 select-none rounded-lg p-2 leading-none no-underline outline-none transition-colors hover:bg-white/5 hover:text-foreground focus:bg-white/5 focus:text-foreground"
                                                    >
                                                        <div className="p-1.5 rounded-lg bg-[#109EB1]/10 text-[#109EB1]">
                                                            <Icon icon={category.icon} width="18" height="18" />
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-hebden font-semibold text-foreground text-sm">{category.name}</span>
                                                            <span className="font-nunito text-xs text-foreground/60">{category.description}</span>
                                                        </div>
                                                    </NavigationMenuLink>
                                                </li>
                                            ))}
                                        </ul>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>

                        <Button variant="ghost">
                            <Link href="https://www.g-portal.com/en/gameserver/hytale-server-hosting?ref=orbisplace" className="font-hebden font-semibold text-base leading-none">
                                Server Hosting
                            </Link>
                        </Button>
                    </div>

                    {session?.user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-3 outline-none group">
                                <Avatar
                                    className="h-11 w-11 border-2 border-primary/80 hover:border-primary transition-colors">
                                    <AvatarImage src={session.user.image || undefined}
                                        alt={session.user.name || 'User'} />
                                    <AvatarFallback className="bg-primary/80 text-white font-hebden">
                                        {session.user.name ? getInitials(session.user.name) : 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="font-hebden text-base text-foreground hidden xl:block">
                                    {session.user.name || session.user.email}
                                </span>
                                <Icon
                                    icon="eva:arrow-down-fill"
                                    className="relative top-[1px] ml-1 transition duration-300 group-data-[state=open]:rotate-180"
                                    aria-hidden="true"
                                />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-56 bg-accent border border-border font-hebden"
                            >
                                {/* General Section */}
                                <DropdownMenuItem asChild className="text-foreground cursor-pointer">
                                    <Link href={`/user/${session.user.name}`}
                                        className="flex items-center gap-2 w-full px-2 py-2">
                                        <Icon icon="mdi:account" width="16" height="16" className="text-current" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="text-foreground cursor-pointer">
                                    <Link href="/dashboard/reports"
                                        className="flex items-center gap-2 w-full px-2 py-2">
                                        <Icon icon="mdi:flag" width="16" height="16" className="text-current" />
                                        My Reports
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="text-foreground cursor-pointer">
                                    <Link href="/dashboard/notifications"
                                        className="flex items-center gap-2 w-full px-2 py-2">
                                        <Icon icon="mdi:bell" width="16" height="16" className="text-current" />
                                        Notifications
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="text-foreground cursor-pointer">
                                    <Link href="/dashboard/collections"
                                        className="flex items-center gap-2 w-full px-2 py-2">
                                        <Icon icon="mdi:folder-multiple" width="16" height="16" className="text-current" />
                                        Collections
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="bg-[#084B54]" />

                                {/* Content Section */}
                                <DropdownMenuItem asChild className="text-foreground cursor-pointer">
                                    <Link href="/dashboard/resources"
                                        className="flex items-center gap-2 w-full px-2 py-2">
                                        <Icon icon="mdi:package-variant" width="16" height="16" className="text-current" />
                                        My Resources
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="text-foreground cursor-pointer">
                                    <Link href="/dashboard/teams"
                                        className="flex items-center gap-2 w-full px-2 py-2">
                                        <Icon icon="mdi:account-group" width="16" height="16" className="text-current" />
                                        My Teams
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="text-foreground cursor-pointer">
                                    <Link href="/dashboard/servers"
                                        className="flex items-center gap-2 w-full px-2 py-2">
                                        <Icon icon="mdi:server" width="16" height="16" className="text-current" />
                                        My Servers
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="text-foreground cursor-pointer">
                                    <Link href="/dashboard/showcase"
                                        className="flex items-center gap-2 w-full px-2 py-2">
                                        <Icon icon="mdi:image-multiple" width="16" height="16" className="text-current" />
                                        My Showcase
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="bg-[#084B54]" />

                                {/* Admin Panel - Only for Moderator+ */}
                                {(session.user as any).role && ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role) && (
                                    <>
                                        <DropdownMenuItem asChild className="text-foreground cursor-pointer bg-primary/10 hover:bg-primary/20">
                                            <Link href="/admin"
                                                className="flex items-center gap-2 w-full px-2 py-2">
                                                <Icon icon="mdi:shield-crown" width="16" height="16" className="text-primary" />
                                                <span className="font-semibold">Admin Panel</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-[#084B54]" />
                                    </>
                                )}

                                {/* Settings Section */}
                                <DropdownMenuItem asChild className="text-foreground cursor-pointer">
                                    <Link href="/dashboard/settings"
                                        className="flex items-center gap-2 w-full px-2 py-2">
                                        <Icon icon="mdi:cog" width="16" height="16" className="text-current" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="bg-[#084B54]" />

                                <DropdownMenuItem
                                    onClick={handleSignOut}
                                    className="text-destructive cursor-pointer data-[highlighted]:text-destructive"
                                >
                                    <Icon icon="mdi:logout" width="16" height="16" className="text-current" />
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <button
                            className="rounded-full flex h-11 w-[130px] bg-primary/80 font-hebden text-base text-white data-active:bg-primary hover:bg-primary transition-all cursor-pointer">
                            <Link
                                href="/login"
                                className="w-full flex items-center gap-2.5 justify-center">
                                <Icon icon="mdi:login" width="24" height="24" className="text-current" /> Sign In
                            </Link>
                        </button>
                    )}
                </div>
            </nav>

            {/* Mobile Navbar */}
            <nav className="lg:hidden w-full z-50 h-[70px] relative flex justify-center px-4 bg-background/80 backdrop-blur-md border-b border-border/50">
                <div className="flex max-w-6xl justify-between w-full items-center gap-2">
                    {/* Navigation Menu Button à gauche */}
                    <button
                        onClick={() => setMobileNavOpen(!mobileNavOpen)}
                        className="p-2 text-foreground hover:text-primary transition-colors z-50"
                        aria-label="Toggle navigation"
                    >
                        {mobileNavOpen ? <Icon icon="mdi:close" width="28" height="28" className="text-current" /> : <Icon icon="mdi:menu" width="28" height="28" className="text-current" />}
                    </button>

                    {/* Logo au centre */}
                    <Link href="/" className="absolute left-1/2 transform -translate-x-1/2">
                        <Image
                            src="/navbar_header.png"
                            alt="Orbis Logo"
                            width={100}
                            height={35}
                            priority
                        />
                    </Link>

                    {/* Profile Menu à droite */}
                    <div className="flex items-center">
                        {session?.user ? (
                            <button
                                onClick={() => setMobileProfileOpen(!mobileProfileOpen)}
                                className="p-0 z-50"
                                aria-label="Toggle profile menu"
                            >
                                <Avatar className="h-10 w-10 border-2 border-primary/80">
                                    <AvatarImage src={session.user.image || undefined}
                                        alt={session.user.name || 'User'} />
                                    <AvatarFallback className="bg-primary/80 text-white font-hebden">
                                        {session.user.name ? getInitials(session.user.name) : 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/80 hover:bg-primary rounded-full transition-all"
                            >
                                <Icon icon="mdi:login" width="18" height="18" className="text-white" />
                                <span className="font-hebden text-sm text-white font-semibold">Sign In</span>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation Menu (gauche) */}
            {mobileNavOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-background/95 backdrop-blur-md z-40 overflow-y-auto"
                    style={{ top: '70px' }}
                    onTouchMove={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col h-full">
                        <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
                            {/* Discover Section */}
                            <div className="space-y-1">
                                <h3 className="font-hebden font-semibold text-sm text-foreground/60 uppercase tracking-wider mb-3">
                                    Discover
                                </h3>

                                {/* Resources */}
                                <Link
                                    href="/resources"
                                    onClick={closeMobileNav}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors group"
                                >
                                    <div className="p-1.5 rounded-lg bg-[#109EB1]/10 text-[#109EB1]">
                                        <Icon icon="mdi:compass" width="18" height="18" />
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <span className="font-hebden font-semibold text-sm text-foreground">
                                            Resources
                                        </span>
                                        <span className="font-nunito text-xs text-foreground/60">
                                            Browse mods, plugins, and more
                                        </span>
                                    </div>
                                    <Icon icon="mdi:chevron-right" width="20" height="20" className="text-foreground/40 group-hover:text-foreground/60" />
                                </Link>

                                {/* Find Servers */}
                                <Link
                                    href="/servers"
                                    onClick={closeMobileNav}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors group"
                                >
                                    <div className="p-1.5 rounded-lg bg-[#109EB1]/10 text-[#109EB1]">
                                        <Icon icon="mdi:server" width="18" height="18" />
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <span className="font-hebden font-semibold text-sm text-foreground">
                                            Find Servers
                                        </span>
                                        <span className="font-nunito text-xs text-foreground/60">
                                            Join active multiplayer communities
                                        </span>
                                    </div>
                                    <Icon icon="mdi:chevron-right" width="20" height="20" className="text-foreground/40 group-hover:text-foreground/60" />
                                </Link>

                                {/* Creators */}
                                <Link
                                    href="/creators"
                                    onClick={closeMobileNav}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors group"
                                >
                                    <div className="p-1.5 rounded-lg bg-[#109EB1]/10 text-[#109EB1]">
                                        <Icon icon="mdi:account-group" width="18" height="18" />
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <span className="font-hebden font-semibold text-sm text-foreground">
                                            Creators
                                        </span>
                                        <span className="font-nunito text-xs text-foreground/60">
                                            Support & follow top developers
                                        </span>
                                    </div>
                                    <Icon icon="mdi:chevron-right" width="20" height="20" className="text-foreground/40 group-hover:text-foreground/60" />
                                </Link>

                                {/* Showcase */}
                                <Link
                                    href="/showcase"
                                    onClick={closeMobileNav}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors group"
                                >
                                    <div className="p-1.5 rounded-lg bg-[#E9735B]/10 text-[#E9735B]">
                                        <Icon icon="mdi:image-multiple" width="18" height="18" />
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <span className="font-hebden font-semibold text-sm text-foreground">
                                            Showcase
                                        </span>
                                        <span className="font-nunito text-xs text-foreground/60">
                                            Community gallery & WIP projects
                                        </span>
                                    </div>
                                    <Icon icon="mdi:chevron-right" width="20" height="20" className="text-foreground/40 group-hover:text-foreground/60" />
                                </Link>
                            </div>

                            {/* Marketplace Categories */}
                            <div className="space-y-1">
                                <h3 className="font-hebden font-semibold text-sm text-foreground/60 uppercase tracking-wider mb-3">
                                    Marketplace
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {marketplaceCategories.map((category) => (
                                        <Link
                                            key={category.href}
                                            href={category.href}
                                            onClick={closeMobileNav}
                                            className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                                        >
                                            <Icon icon={category.icon} width="18" height="18" className="text-primary" />
                                            <span className="font-hebden font-medium text-sm text-foreground">
                                                {category.name}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Server Hosting */}
                            <div className="space-y-1">
                                <h3 className="font-hebden font-semibold text-sm text-foreground/60 uppercase tracking-wider mb-3">
                                    Hosting
                                </h3>
                                <Link
                                    href="https://g-portal.com/?ref=orbisplace"
                                    onClick={closeMobileNav}
                                    className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-accent transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                            <Icon icon="mdi:server-network" width="18" height="18" />
                                        </div>
                                        <span className="font-hebden font-semibold text-sm text-foreground">
                                            Server Hosting
                                        </span>
                                    </div>
                                    <Icon icon="mdi:open-in-new" width="18" height="18" className="text-foreground/40 group-hover:text-foreground/60" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Profile Menu (droite) */}
            {mobileProfileOpen && session?.user && (
                <div
                    className="lg:hidden fixed inset-0 bg-background/95 backdrop-blur-md z-40 overflow-y-auto"
                    style={{ top: '70px' }}
                    onTouchMove={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col h-full">
                        <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
                            {/* User Info en haut */}
                            <div className="flex items-center gap-3 pb-6 border-b border-border">
                                <Avatar className="h-12 w-12 border-2 border-primary/80">
                                    <AvatarImage src={session.user.image || undefined}
                                        alt={session.user.name || 'User'} />
                                    <AvatarFallback className="bg-primary/80 text-white font-hebden">
                                        {session.user.name ? getInitials(session.user.name) : 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-hebden text-lg font-semibold text-foreground">
                                        {session.user.name || 'User'}
                                    </span>
                                    <span className="font-nunito text-sm text-foreground/60">
                                        {session.user.email}
                                    </span>
                                </div>
                            </div>

                            {/* Profile & Settings */}
                            <div className="space-y-1">
                                <h3 className="font-hebden font-semibold text-sm text-foreground/60 uppercase tracking-wider mb-3">
                                    General
                                </h3>

                                <Link href={`/user/${session.user.name}`} onClick={closeMobileProfile}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors">
                                    <Icon icon="mdi:account" width="20" height="20" className="text-primary" />
                                    <span className="font-hebden font-medium text-foreground">Profile</span>
                                </Link>

                                <Link href="/dashboard/reports" onClick={closeMobileProfile}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors">
                                    <Icon icon="mdi:flag" width="20" height="20" className="text-primary" />
                                    <span className="font-hebden font-medium text-foreground">My Reports</span>
                                </Link>

                                <Link href="/dashboard/notifications" onClick={closeMobileProfile}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors">
                                    <Icon icon="mdi:bell" width="20" height="20" className="text-primary" />
                                    <span className="font-hebden font-medium text-foreground">Notifications</span>
                                </Link>

                                <Link href="/dashboard/collections" onClick={closeMobileProfile}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors">
                                    <Icon icon="mdi:folder-multiple" width="20" height="20" className="text-primary" />
                                    <span className="font-hebden font-medium text-foreground">Collections</span>
                                </Link>
                            </div>

                            {/* Dashboard Links */}
                            <div className="space-y-1">
                                <h3 className="font-hebden font-semibold text-sm text-foreground/60 uppercase tracking-wider mb-3">
                                    Content
                                </h3>

                                <Link href="/dashboard/resources" onClick={closeMobileProfile}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors">
                                    <Icon icon="mdi:package-variant" width="20" height="20" className="text-primary" />
                                    <span className="font-hebden font-medium text-foreground">My Resources</span>
                                </Link>

                                <Link href="/dashboard/teams" onClick={closeMobileProfile}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors">
                                    <Icon icon="mdi:account-group" width="20" height="20" className="text-primary" />
                                    <span className="font-hebden font-medium text-foreground">My Teams</span>
                                </Link>

                                <Link href="/dashboard/servers" onClick={closeMobileProfile}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors">
                                    <Icon icon="mdi:server" width="20" height="20" className="text-primary" />
                                    <span className="font-hebden font-medium text-foreground">My Servers</span>
                                </Link>

                                <Link href="/dashboard/showcase" onClick={closeMobileProfile}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors">
                                    <Icon icon="mdi:image-multiple" width="20" height="20" className="text-primary" />
                                    <span className="font-hebden font-medium text-foreground">My Showcase</span>
                                </Link>
                            </div>

                            {/* Admin Panel - Only for Moderator+ */}
                            {(session.user as any).role && ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role) && (
                                <div className="space-y-1">
                                    <h3 className="font-hebden font-semibold text-sm text-foreground/60 uppercase tracking-wider mb-3">
                                        Administration
                                    </h3>

                                    <Link href="/admin" onClick={closeMobileProfile}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors">
                                        <Icon icon="mdi:shield-crown" width="20" height="20" className="text-primary" />
                                        <span className="font-hebden font-semibold text-foreground">Admin Panel</span>
                                    </Link>
                                </div>
                            )}

                            {/* Settings */}
                            <div className="space-y-1">
                                <h3 className="font-hebden font-semibold text-sm text-foreground/60 uppercase tracking-wider mb-3">
                                    Settings
                                </h3>

                                <Link href="/dashboard/settings" onClick={closeMobileProfile}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors">
                                    <Icon icon="mdi:cog" width="20" height="20" className="text-primary" />
                                    <span className="font-hebden font-medium text-foreground">Settings</span>
                                </Link>
                            </div>
                        </div>

                        {/* Sign Out button en bas */}
                        <div className="px-6 py-6 border-t border-border bg-secondary/30">
                            <button
                                onClick={handleSignOut}
                                className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl bg-destructive/10 hover:bg-destructive/20 transition-colors"
                            >
                                <Icon icon="mdi:logout" width="20" height="20" className="text-destructive" />
                                <span className="font-hebden font-semibold text-base text-destructive">
                                    Sign Out
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}