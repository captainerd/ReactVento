import React, { useState } from 'react';

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useDispatch } from 'react-redux';
import ThemeToggle from "@/components/ui/theme-toggle"
import CartButton from "@/app-components/CartButton"
import { Phone, Search, Menu, User } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Link, useNavigate } from 'react-router-dom';
import { selectUserData, setUserInfo } from "@/store/slices/userInfoSlice"
import { useSelector } from 'react-redux';
import apiRequest from "@/lib/apiRequest"
import config from '@/config';
import DynamicAlertDialog from './DynamicAlertDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Component({ menuData, headerData }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const userInfo = useSelector((state) => state.userInfo);

  const userInfo = useSelector(selectUserData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [logingSuccess, setLogingSuccess] = useState(null);



  const handleLogin = async () => {
    setIsLoggingIn(true);

    try {
      const API_PUBLIC_KEY = import.meta.env.VITE_PUBLIC_KEY;

      // Compute the signature: SHA256(email + password + API_PUBLIC_KEY)
      let textToHash = password + email + API_PUBLIC_KEY;

      let encoder = new TextEncoder();
      let datas = encoder.encode(textToHash);
      let hashBuffer = await crypto.subtle.digest("SHA-256", datas);

      // Convert the hash buffer to a hex string
      let hashArray = Array.from(new Uint8Array(hashBuffer));
      let signature = hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");

      // Create form data in URL-encoded format
      let formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("signature", signature);

      const response = await apiRequest(`${config.apiUrl}/?route=account/login.apilogin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error("Login failed: " + (await response.text()));
      }

      let data = await response.json();
      if (data.success) {
        setLogingSuccess({ title: data.heading_title, description: data.success })
        setIsDialogOpen(false);
        dispatch(setUserInfo({ loggedIn: true }));
      }
      if (data.error) {
        setLogingSuccess({ title: '', description: data.error.warning })

      }
      console.log("Login successful:", data);

    } catch (error) {
      console.error("Login error:", error);

    } finally {
      setIsLoggingIn(false);
    }
  };


  const handleMenuClick = (e, name = null) => {
    e = e.replace(/&amp;/g, '&');
    let params = new URLSearchParams(e);

    let categoryId = params.get('path');

    // Make SEO-friendly path
    name = name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');

    // Navigate with state
    navigate(`/category/${name}`, { state: { categoryId } });
  };


  const handleLogOut = async () => {
    try {
      const response = await apiRequest(`${config.apiUrl}/?route=account/logout`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setLogingSuccess({ title: data.heading_title, description: data.text_message })
        dispatch(setUserInfo({ loggedIn: false }));
      }
      console.log(data);
      // Process the data here
    } catch (error) {
      console.error("An error occurred:", error);
      // Handle the error (e.g., show a message to the user)
    }

  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:border-gray-800 shadow dark:bg-gray-950">
      {logingSuccess && <DynamicAlertDialog
        title={logingSuccess.heading_title}
        description={logingSuccess.description}
        onClose={() => setLogingSuccess(null)}

      />}
      <div className="   flex items-center justify-between px-4 md:px-6 py-2">
        {/* Left Section: Logo */}
        <div className="flex justify-start items-center">
          <Link to="/" className="flex justify-start items-center gap-2">
            <img
              style={{ maxWidth: '200px' }} // Inline style for logo size
              alt={headerData.title}
              src={config.apiUrl + headerData.logo}
              className="mr-3"
            />
          </Link>
        </div>

        {/* Middle Section: Menu */}
        <div className="hidden md:flex flex-wrap gap-6 text-sm font-medium">
          {menuData?.map((menuItem, index) => (
            <div key={index} className="relative group">
              <a
                onClick={(e) => handleMenuClick(menuItem.href, menuItem.name)}
                href={"#"}
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 whitespace-nowrap"
              >
                {menuItem.name}
              </a>

              {menuItem.children && menuItem.children.length > 0 && (
                <div
                  className="absolute left-0 top-full hidden bg-white shadow-md dark:bg-gray-950 group-hover:block p-3 z-10"
                  style={{
                    minWidth: 'fit-content', // Ensures the width fits the content
                    whiteSpace: 'nowrap', // Prevents text from wrapping
                  }}
                >
                  {menuItem.children.map((child, childIndex) => (
                    <a
                      key={childIndex}
                      onClick={(e) => handleMenuClick(child.href, child.name)}
                      href={"#"}
                      className="block px-4 py-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                    >
                      {child.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>







        {/* Right Section: Icons */}
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 text-sm font-medium md:flex">
            <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-500 dark:text-gray-400">{headerData.telephone}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hidden sm:block">
                <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[300px] p-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input type="search" placeholder="Search..." defaultValue="" className="pl-8 w-full" />
              </div>

            </DropdownMenuContent>
          </DropdownMenu>



          <DropdownMenu>
            <DropdownMenuTrigger asChild>

              <Button variant="ghost" size="icon" className="rounded-full">
                <User className={`h-5 w-5 ${userInfo.loggedIn ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`} />

              </Button>

            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px] p-2">
              {/* Dropdown items */}
              {userInfo.loggedIn ?
                <>
                  <DropdownMenuItem onClick={() => console.log("Profile clicked")}>
                    My Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => console.log("Settings clicked")}>
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLogOut()} >
                    Logout
                  </DropdownMenuItem>
                </>
                :
                <>




                  <DropdownMenuItem onClick={() => console.log("Settings clicked")}>
                    Register
                  </DropdownMenuItem>



                  <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>Login</DropdownMenuItem>

                </>


              }
            </DropdownMenuContent>
          </DropdownMenu>

          <CartButton aria-label="Toggle dark mode" className="rounded-full" />

          <ThemeToggle aria-label="Toggle dark mode" className="rounded-full hidden md:block" />
          {/* Mobile menu trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-white md:hidden dark:dark:bg-gray-700">
                <Menu className="h-5 w-5 text-gray-500 dark:text-gray-400  " />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="md:hidden">
              <SheetDescription className="md:hidden" />

              <SheetTitle>Menu</SheetTitle>
              <div className="grid gap-4 p-4">
                {menuData?.map((menuItem, index) => (
                  <a
                    key={index}
                    onClick={(e) => handleMenuClick(child.href)}
                    href={"#"}
                    className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  >
                    {menuItem.name}
                  </a>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="primary"
              onClick={handleLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Logging in..." : "Login"}
            </Button>
            {/* Optional: Close button */}
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header >



  );
}









