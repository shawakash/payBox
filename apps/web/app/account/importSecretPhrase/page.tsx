export default function Page({ params }: { params: { id: string } }) {
    console.log(params)
    return <div>From Import Secret: {params.id}</div>
}