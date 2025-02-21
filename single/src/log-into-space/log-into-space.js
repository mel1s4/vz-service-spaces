import React, {useState} from 'react';
import './log-into-space.scss';
const LogIntoSpace = () => {
  const [code, setCode] = useState('');

  function filterSetCode(value) {
    // example: ASD2-3D4F-5G6H
    if (value.length > 12) return;
    // only letters and numbers
    if (/[^a-zA-Z0-9-]/.test(value)) {
      return;
    } else {
      setCode(value.replace(/\s/g, '').toUpperCase());
    }
  }

  function formattedCode() {
    const nCode = code.replace(/(.{4})/g, '$1-').trim();
    // if las char is - remove it
    if (nCode.charAt(nCode.length - 1) === '-') {
      return nCode.slice(0, -1);
    }
    return nCode;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (code.length !== 12) return;
    const url = '?vz_space_uid=' + code;
    const domain = window.location.origin;
    window.location.href = domain + url;
    console.log('code', code);
  }

  return (
    <div className="LogIntoSpace">
      <h2 className="vz-ss__login-space__title">
        Acceder a una Mesa
      </h2>
      <form onSubmit={(e) => handleSubmit(e)}>
        <input type="text"
              placeholder='ASD2-3D4F-5G6H'
              value={code} 
              onChange={(e) => filterSetCode(e.target.value)} />
        <label>
          Codigo de la Mesa
        </label>
        <p>
          {formattedCode()}
        </p>
        <button type="submit" className={
          code.length === 12 ? '' : '--disabled'
        }>
          Acceder
        </button>
      </form>

    </div>
  );
}

export default LogIntoSpace;