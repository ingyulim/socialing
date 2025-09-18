import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%);
    min-height: 100vh;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    font-family: inherit;
  }

  input {
    border: none;
    outline: none;
    font-family: inherit;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    color: #2c3e50;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .btn {
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 16px;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .btn-primary {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
    color: white;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(52, 152, 219, 0.4);
  }

  .btn-secondary {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
  }

  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  .input {
    padding: 12px 16px;
    border-radius: 12px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.95);
    font-size: 16px;
    width: 100%;
    transition: all 0.3s ease;
    color: #2c3e50;
  }

  .input:focus {
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  }

  .input::placeholder {
    color: #7f8c8d;
  }

  .title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #2c3e50;
    text-align: center;
    margin-bottom: 2rem;
  }

  .subtitle {
    font-size: 1.2rem;
    color: #34495e;
    text-align: center;
    margin-bottom: 2rem;
  }

  /* 카드 내부 텍스트 색상 */
  .card h1, .card h2, .card h3, .card h4, .card h5, .card h6 {
    color: #2c3e50;
  }

  .card p, .card span, .card div {
    color: #2c3e50;
  }

  /* 링크 색상 */
  a {
    color: #2c3e50;
    text-decoration: none;
    transition: color 0.3s ease;
  }

  a:hover {
    color: #1f2a35;
  }
`;

export default GlobalStyle;
