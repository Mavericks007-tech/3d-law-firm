export default function Footer() {
  return (
    <footer className="border-t border-ink/10 py-12">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 text-[0.85rem] text-muted md:flex-row md:items-center md:justify-between md:px-8">
        <p>
          Wildan Legal Solicitors is authorised and regulated by the Solicitors
          Regulation Authority.
        </p>
        <p>&copy; {new Date().getFullYear()} Wildan Legal Solicitors</p>
      </div>
    </footer>
  );
}
