import Image from "next/image";
import { ingredientPhoto, type PhotoSpec } from "@/lib/roxo-media";
export function PhotoAtlas({ photo, alt="", sizes="512px", className }: { photo:PhotoSpec;alt?:string;sizes?:string;className?:string }) {
 const col=photo.index%photo.columns;const row=Math.floor(photo.index/photo.columns);
 return <Image src={photo.src} alt={alt} width={photo.columns*256} height={photo.rows*256} sizes={sizes} className={className} style={{position:"absolute",transformOrigin:`${(col+.5)/photo.columns*100}% ${(row+.5)/photo.rows*100}%`,width:`${photo.columns*100}%`,height:`${photo.rows*100}%`,maxWidth:"none",left:`-${col*100}%`,top:`-${row*100}%`,right:"auto",bottom:"auto",objectFit:"fill"}}/>;
}
export function IngredientPhoto({ name, className="size-12" }: {name:string;className?:string}) {
 const photo=ingredientPhoto(name);if(!photo)return null;
 return <span aria-hidden className={`relative block shrink-0 overflow-hidden rounded-xl bg-[#eee3f3] ${className}`}><PhotoAtlas photo={photo}/></span>;
}
