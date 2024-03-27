export default function Page({ params }: { params: { id: string } }) {
    console.log(params);
    //TODO: FETCH THE TXN DATA FOR THIS FOR THIS ACCOUNT
    return <div>From statements: {params.id}</div>
}