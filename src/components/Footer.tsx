import WordMark from "@/components/WordMark";
import Link from "next/link";

const navigation = [
  { label: "Features", link: "/#features" },
  { label: "Integrations", link: "/#integrations" },
  { label: "Pricing", link: "/#pricing" },
  { label: "Contact", link: "/#contact" },
];

export default function Footer() {
  return (
    <footer className="flex flex-col items-center justify-between gap-6 border-t border-slate-200 bg-white px-8 py-7 md:flex-row">
      <Link href="/">
        <WordMark />
        <span className="sr-only">VeriText AI Home Page</span>
      </Link>
      <nav aria-label="Footer">
        <ul className="flex gap-6">
          {navigation.map((item) => (
            <li key={item.label}>
              <Link
                href={item.link}
                className="inline-flex min-h-11 items-center"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-4 w-full text-center md:mt-0 md:w-auto">
        <p className="text-sm text-slate-500">Copyright @2025 - Made by Team GitGoneWild</p>
      </div>
    </footer>
  );
}
