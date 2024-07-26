'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import InputField from '@/components/FeedWrite/InputField';
import LocationButton from '@/components/FeedWrite/LocationButton';
import ImageUpload from '@/components/FeedWrite/ImageUpload';
import TextArea from '@/components/FeedWrite/TextArea';

function FeedWrite() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // 주석 처리: 실제 사용자 인증 체크
    // const checkUser = async () => {
    //   const { data, error } = await supabase.auth.getUser();
    //   if (error || !data.user) {
    //     router.replace('/login');
    //   }
    // };
    // checkUser();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 주석 처리: 실제 사용자 인증 체크
    // const { data: userData, error: userError } = await supabase.auth.getUser();

    // if (userError || !userData.user) {
    //   alert('You need to be logged in to create a post');
    //   return;
    // }

    const userId = '2596d4ff-f4e9-4875-a67c-22abc5fdacfa'; // 임시 사용자 ID

    let imageUrls: string[] = [];
    for (const image of images) {
      const fileName = image.name.replace(/[^a-z0-9]/gi, '_').toLowerCase(); // 파일 이름 슬러그화
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('FeedImage') // 여기에 버킷 이름이 들어갑니다. 예: 'images'
        .upload(`public/${fileName}`, image);

      if (uploadError) {
        console.error('Upload Error:', uploadError);
        alert('Error uploading image');
        return;
      }

      const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${uploadData.path}`;
      imageUrls.push(imageUrl);
    }

    const { error } = await supabase.from('posts').insert({
      title,
      location,
      content,
      image_urls: imageUrls,
      user_id: userId,
    });

    if (error) {
      console.error('Insert Post Error:', error);
      alert('Error creating post');
    } else {
      alert('Post created successfully');
      router.push('/');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="header flex justify-between mb-4">
        <button onClick={() => router.back()} className="btn">
          뒤로가기
        </button>
        <button onClick={handleSubmit} className="btn">
          등록
        </button>
      </div>
      <div className="body flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <InputField value={title} onChange={setTitle} placeholder="제목" />
          <hr className="border-gray-300 border" />
          <LocationButton location={location} setLocation={setLocation} />
          <ImageUpload
            images={images}
            setImages={setImages}
            imagePreviews={imagePreviews}
            setImagePreviews={setImagePreviews}
          />
          <TextArea
            value={content}
            onChange={setContent}
            placeholder="내용을 입력해주세요"
          />
        </form>
      </div>
    </div>
  );
}

export default FeedWrite;
