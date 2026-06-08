import '../assets/styles/FooterComponent.css';

const FooterComponent = () => {
  const anio = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <p>Christian Berti, Fabricio Gonzalez, Ezequiel Alcayaga - {anio}</p>
    </footer>
  );
};

export default FooterComponent;