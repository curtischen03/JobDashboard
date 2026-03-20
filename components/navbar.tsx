"use client"

import { Book, Menu, Sunset, Trees, Zap } from "lucide-react"

import { cn } from "@/lib/utils"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { auth } from "utils/firebase"
import { signOut } from "firebase/auth"
import { useAuth } from "@/context/AuthContext"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface MenuItem {
  title: string
  url: string
  description?: string
  icon?: React.ReactNode
  items?: MenuItem[]
}

interface NavbarProps {
  className?: string
  logo?: {
    url: string
    src: string
    alt: string
    title: string
    className?: string
  }
  loggedOutMenu?: MenuItem[]
  loggedInMenu?: MenuItem[]
  authText?: {
    login: {
      title: string
      url: string
    }
    signup: {
      title: string
      url: string
    }
  }
}

const Navbar = ({
  logo = {
    url: "/",
    src: "./icon.svg",
    alt: "logo",
    title: "",
  },
  loggedOutMenu = [{ title: "Jobs", url: "/" }],
  loggedInMenu = [
    { title: "Jobs", url: "/" },
    { title: "Applied Jobs", url: "/applied-jobs" },
    { title: "Stats", url: "/stats" },
  ],
  authText = {
    login: { title: "Login", url: "/login" },
    signup: { title: "Sign up", url: "/signup" },
  },
  className,
}: NavbarProps) => {
  const router = useRouter()
  const signout = async () => {
    signOut(auth)
      .then(() => {
        console.log("Signed out")
        window.location.href = "/"
      })
      .catch((error) => {
        console.log("Error:", error)
      })
  }
  const { loggedIn, loading } = useAuth()
  return (
    <section className={cn("py-4", className)}>
      <div className="container mx-auto px-5">
        {/* Desktop Menu */}
        <nav className="hidden items-center justify-between lg:flex">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <a href={logo.url} className="flex items-center gap-2">
              <img
                src={logo.src}
                className="max-h-8 dark:invert"
                alt={logo.alt}
              />
              <span className="text-lg font-semibold tracking-tighter">
                {logo.title}
              </span>
            </a>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {!loading &&
                    (loggedIn
                      ? loggedInMenu.map((item) => renderMenuItem(item))
                      : loggedOutMenu.map((item) => renderMenuItem(item)))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex gap-2">
            {!loading &&
              (loggedIn ? (
                <Button size="sm" onClick={signout}>
                  Logout
                </Button>
              ) : (
                <div>
                  <Button asChild variant="outline" size="sm">
                    <a href={authText.login.url}>{authText.login.title}</a>
                  </Button>
                  <Button asChild size="sm">
                    <a href={authText.signup.url}>{authText.signup.title}</a>
                  </Button>
                </div>
              ))}
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href={logo.url} className="flex items-center gap-2">
              <img
                src={logo.src}
                className="max-h-8 dark:invert"
                alt={logo.alt}
              />
            </a>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <a href={logo.url} className="flex items-center gap-2">
                      <img
                        src={logo.src}
                        className="max-h-8 dark:invert"
                        alt={logo.alt}
                      />
                    </a>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 p-4">
                  <Accordion
                    type="single"
                    collapsible
                    className="flex w-full flex-col gap-4"
                  >
                    {!loading &&
                      (loggedIn
                        ? loggedInMenu.map((item) => renderMobileMenuItem(item))
                        : loggedOutMenu.map((item) =>
                            renderMobileMenuItem(item)
                          ))}
                    {!loading && loggedIn && (
                      <Button className="mt-6" onClick={signout}>
                        Logout
                      </Button>
                    )}
                    {!loading &&
                      !loggedIn &&
                      [
                        { title: "Log In", url: "/login" },
                        { title: "Sign Up", url: "/signup" },
                      ].map((item) => renderMobileMenuItem(item))}
                  </Accordion>

                  <div className="flex flex-col gap-3">
                    {loading &&
                      (loggedIn ? (
                        <Button onClick={signout}>Logout</Button>
                      ) : (
                        <div>
                          <Button asChild variant="outline">
                            <a href={authText.login.url}>
                              {authText.login.title}
                            </a>
                          </Button>
                          <Button asChild>
                            <a href={authText.signup.url}>
                              {authText.signup.title}
                            </a>
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  )
}

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
          {item.items.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.title} className="w-80">
              <SubMenuLink item={subItem} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    )
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink
        href={item.url}
        className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-accent-foreground"
      >
        {item.title}
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
}

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <SubMenuLink key={subItem.title} item={subItem} />
          ))}
        </AccordionContent>
      </AccordionItem>
    )
  }

  return (
    <a key={item.title} href={item.url} className="text-md font-semibold">
      {item.title}
    </a>
  )
}

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <a
      className="flex min-w-80 flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-muted hover:text-accent-foreground"
      href={item.url}
    >
      <div className="text-foreground">{item.icon}</div>
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description && (
          <p className="text-sm leading-snug text-muted-foreground">
            {item.description}
          </p>
        )}
      </div>
    </a>
  )
}

export { Navbar }
