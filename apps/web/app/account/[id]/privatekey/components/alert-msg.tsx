import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import { RocketIcon } from "lucide-react"

export function AlertMsg({
    message,
    title = "Heads up!",
    variant = "default",
}: {
    message: string
    title?: string 
    variant?: "default" | "destructive",
}) {
    return (
        <Alert variant={variant}>
            <RocketIcon className="h-4 w-4" color="#ff4545" />
            <AlertTitle className="text-[#ff4545]">{title}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    )

}