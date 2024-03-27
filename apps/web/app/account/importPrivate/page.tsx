export default function Page({ params }: { params: { id: string } }) {
    console.log(params)
    return <div>From import Private: {params.id}</div>
}