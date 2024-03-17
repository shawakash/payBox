"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toBase64 } from "@/lib/helper";
import { PencilIcon, User2Icon } from "lucide-react";
import React from "react";

type AvatarUploadProps = {
	value?: string;
    fallbackName: string;
	onChange?: (value?: string) => void;
}

export function AvatarUpload({
	value,
    fallbackName,
	onChange
}: AvatarUploadProps) {
	
	const inputRef = React.useRef<HTMLInputElement>(null)
	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const file = e.target.files[0];
			const base64 = await toBase64(file) as string;
			onChange?.(base64);
		}
	}
	
	return (
		<div className="relative w-20 h-20">
			<Avatar className="w-full h-full">
				<AvatarImage src={value} className="object-cover"/>
				<AvatarFallback className="bg-secondary text-xl">
                    {fallbackName}
				</AvatarFallback>
			</Avatar>
			<Button
				variant="ghost"
				size="icon"
				className="rounded-full w-7 h-7 p-1 bg-secondary-foreground/90 hover:bg-secondary-foreground absolute bottom-0 right-0"
				onClick={e => {
					e.preventDefault()
					inputRef.current?.click()
				}}
			>
				<PencilIcon className="w-4 h-4 text-black"/>
			</Button>
			<Input
				ref={inputRef}
				type="file"
				className="hidden"
				onChange={handleChange}
				accept="image/*"
			/>
		</div>
	)
}