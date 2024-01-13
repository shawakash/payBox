//server component
import AddToCart from '@/app/components/Client/AddToCart';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/Client/Card';
import Users from '@/app/components/Client/Users';
import { User } from '@/app/types/interface';
import React from 'react';



export type CardProps = React.ComponentProps<typeof Card>

const NewUser = async () => {

    /**
     * Caching: 
     * by default nextjs renders statically and cached it unless 
     * cache is no-store.
     * Axios doesn't provides caching so use fetch
     */
    const res = await fetch(
        "https://jsonplaceholder.typicode.com/users",
        {
            headers: {
                "Content-Type": "applications/json"
            },
            cache: 'no-store', // to cache the response from api,
            // next: { revalidate: 10 }   // fetches the api again in 10 seconds of time in background
        });
    const users: User[] = await res.json();
    return (
        <>
            <AddToCart />
            <h1>
                Users
            </h1>
            <div className="flex justify-center flex-col items-center p-16">
                <div className="flex flex-wrap gap-14 justify-center items-start">
                    <Users
                        users={users}
                    />
                </div>
            </div>
        </>
    );
};

export default NewUser;