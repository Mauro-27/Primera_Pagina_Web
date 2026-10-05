import Header from "./components/Header";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import { Outlet } from 'react-router-dom';
import { Container, CssBaseline, Box } from '@mui/material';


const App = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        <CssBaseline /> 
        <Nav />
        <Header/>
      
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
            <main>
                <Outlet /> 
            </main>
        </Container>
      
        <Footer />
    </Box>
  );
}


export default App;