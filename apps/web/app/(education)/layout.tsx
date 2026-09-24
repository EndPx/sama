import "./learn.css";

export default function EducationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="education-page">{children}</div>;
}
