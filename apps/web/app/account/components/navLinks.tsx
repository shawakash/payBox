
import {
    Archive,
    ArchiveX,
    Inbox,
    Send,
    Trash2,
    File,
    Wallet,
    LayoutDashboard,
    Lock,
    VenetianMask,
    Bitcoin,
    PencilLine,
    FilePlus,
    FilePlus2Icon,
    GanttChart
} from "lucide-react";

export const commonNavLinks = [
    {
        id: "",
        title: "Manage Accounts",
        label: "",
        icon: GanttChart,
        variant: "ghost",
        link: "/account",
    },
    {
        id: "create",
        title: "Create Account",
        label: "128",
        icon: FilePlus2Icon,
        variant: "ghost",
        link: "/account/create",
    },
    {
        id: "importSecretPhrase",
        title: "Import Secret Recovery",
        label: "9",
        icon: FilePlus,
        variant: "ghost",
        link: "/account/importSecretPhrase",
    },
    {
        id: "importPrivate",
        title: "Import From Private-Key",
        label: "",
        icon: Lock,
        variant: "ghost",
        link: "importPrivate",
    },

]

export const getNavLinks = (id: string) => {
    return [
        {
            id: "dashboard",
            title: "Dashboard",
            label: "128",
            icon: LayoutDashboard,
            variant: "ghost",
            link: `/account/${id}/#`,
        },
        {
            id: "statements",
            title: "Statements",
            label: "9",
            icon: Bitcoin,
            variant: "ghost",
            link: `/account/${id}/statements`,
        },
        {
            id: "privatekey",
            title: "Private-Key",
            label: "",
            icon: Lock,
            variant: "ghost",
            link: `/account/${id}/privatekey`,
        },
        {
            id: "secretPhrase",
            title: "Secret",
            label: "23",
            icon: VenetianMask,
            variant: "ghost",
            link: `/account/${id}/secretPhrase`,
        },
        {
            id: "update",
            title: "Update",
            label: "",
            icon: PencilLine,
            variant: "ghost",
            link: `/account/${id}/update`,
        },
        {
            id: "remove",
            title: "Remove",
            label: "",
            icon: Trash2,
            variant: "ghost",
            link: `/account/${id}/remove`,
        },
    ]
}