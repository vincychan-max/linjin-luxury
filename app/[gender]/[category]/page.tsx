import { redirect } from 'next/navigation';



export default async function CategoryRootPage({

  params

}: {

  params: Promise<{ gender: string; category: string }>

}) {

  const { gender, category } = await params;

 

  // ✨ 核心逻辑：当访问 /women/handbags 时，自动重定向到 /women/handbags/all

  // 这样就会触发你已经写好的 [subCategory]/page.tsx 里的 isAll 逻辑

  redirect(`/${gender}/${category}/all`);

}