export default function AboutLayout({children}: {children: React.ReactNode}) {
    return (
        <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold">About Layout</h1>
            <div className="mt-4">{children}</div>
        </div>
    )
}
