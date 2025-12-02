import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { Navigation } from "./Navigation";

export function Header() {
  return (
    <header className="container mx-auto grid grid-cols-3 gap-6 p-6">
      <Image src="/img/logo.svg" alt="Mixtape Logo" width={45} height={45} />
      <Navigation />
      <div className="flex items-center justify-end">
        <UserButton
          appearance={{
            elements: {
              avatarBox: {
                width: "35px",
                height: "35px",
              },
            },
          }}
        />
      </div>
    </header>
  );
}
