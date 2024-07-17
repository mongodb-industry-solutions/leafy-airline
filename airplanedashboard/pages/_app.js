// pages/_app.js
import '../components/Layout.module.css'; 

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
