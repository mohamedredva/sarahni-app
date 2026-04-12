export async function generateMetadata({ params }) {
  // we do not fetch the user to preserve performance, just use the username
  const username = params.username;

  return {
    title: `أرسل سراً إلى ${username}`,
    description: `أرسل رسائل مجهولة بسرية تامة لـ ${username}. لا أحد سيعرف هويتك!`,
    openGraph: {
      title: `أرسل سراً إلى ${username}`,
      description: `اكتب ما في قلبك بسرية وسنوصله لـ ${username}`,
      images: ['/social-share.png'], // can add a custom share image later
    },
  };
}

export default function UserLayout({ children }) {
  return <>{children}</>;
}
