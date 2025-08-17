import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Header() {
  const [location] = useLocation();

  const navigation = [
    { name: "Search Colleges", href: "/search", current: location === "/search" },
    { name: "Compare", href: "/compare", current: location === "/compare" },
    { name: "Check Eligibility", href: "/eligibility", current: location === "/eligibility" },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200" data-testid="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" data-testid="link-home">
              <h1 className="text-2xl font-bold text-scorecard-blue">MyCampusMingle</h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Button
                  variant="ghost"
                  className={`font-medium ${
                    item.current
                      ? "text-scorecard-blue"
                      : "text-scorecard-gray hover:text-scorecard-blue"
                  }`}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                  <Menu className="h-6 w-6 text-scorecard-gray" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="mt-6 space-y-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      data-testid={`mobile-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Button
                        variant="ghost"
                        className={`w-full justify-start font-medium ${
                          item.current
                            ? "text-scorecard-blue"
                            : "text-scorecard-gray hover:text-scorecard-blue"
                        }`}
                      >
                        {item.name}
                      </Button>
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
