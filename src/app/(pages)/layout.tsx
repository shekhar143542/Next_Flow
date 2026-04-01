"use client";

import { ReactNode } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";

type PagesLayoutProps = {
	children: ReactNode;
};

export default function PagesLayout({ children }: PagesLayoutProps) {
	return (
		<ErrorBoundary>
			<ThemeProvider defaultTheme="dark">
				<TooltipProvider>
					<Toaster />
					<div className="flex min-h-screen">
						<Sidebar />
						<main className="flex-1">{children}</main>
					</div>
				</TooltipProvider>
			</ThemeProvider>
		</ErrorBoundary>
	);
}
