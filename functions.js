
function vz_ss_validate_uid() { 
  const input = document.getElementById("vz_ss_space_uid_input");
  const container = document.getElementById("vz_ss_uid");
  // example: ASD3-AS3D-ASD3
  input.value = input.value.replace("-", '').toUpperCase();
  if (input.value.length >= 12) {
    input.value = input.value.slice(0, 12); 
  }
  let nCode = input.value.replace(/(.{4})/g, '$1-').trim();
  // if las char is - remove it
  if (nCode.charAt(nCode.length - 1) === '-') {
    nCode = nCode.slice(0, -1);
  }
  container.innerHTML = nCode;
}

const VzSsUidInput = document.getElementById("vz_ss_space_uid_input");
if (VzSsUidInput) {
  VzSsUidInput.addEventListener("input", vz_ss_validate_uid);
}

const setAddress = document.createElement("div");
setAddress.classList.add("vz-ss__shipping-address-notice");
setAddress.innerHTML = `
    <p> 
      La direccion debe ser la misma que el restaurante para entregarlo en tu mesa.
    </p>
`;
setTimeout(() => {
  if (document.getElementById("shipping")) {
    document.getElementById("shipping").appendChild(setAddress);
  }
}
, 1000);
