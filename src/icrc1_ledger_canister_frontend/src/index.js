import { icrc1_ledger_canister_backend } from "../../declarations/icrc1_ledger_canister_backend";

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const button = e.target.querySelector("button");

  const name = document.getElementById("name").value.toString();

  button.setAttribute("disabled", true);

  // Interact with foo actor, calling the greet method
  const greeting = await icrc1_ledger_canister_backend.greet(name);

  button.removeAttribute("disabled");

  document.getElementById("greeting").innerText = greeting;

  return false;
});
document.getElementById("connect").onclick = async () => {
  const principal = await connectPlug();
  if (principal) {
    // Display balance
    const balance = await getBalance(principal);
    document.getElementById("balance").innerText = `Balance: ${balance}`;
  }
};

document.getElementById("transfer").onclick = async () => {
  const recipient = document.getElementById("recipient").value;
  const amount = BigInt(document.getElementById("amount").value);
  const result = await transferTokens(recipient, amount);
  alert(result);
};

async function connectPlug() {
  const result = await window.ic.plug.requestConnect();
  if (result) {
    const principal = await window.ic.plug.agent.getPrincipal();
    console.log("Connected principal:", principal.toText());
    return principal;
  } else {
    console.error("Plug connection failed");
  }
}

async function getBalance(principal) {
  const actor = await createActor();
  const balanceResult = await actor.getBalance(principal.toText());
  if (balanceResult.ok) {
    return balanceResult.ok;
  } else {
    console.error(balanceResult.err);
  }
}

async function transferTokens(to, amount) {
  const actor = await createActor();
  const transferResult = await actor.transferTokens(to, amount);
  if (transferResult.ok) {
    return transferResult.ok;
  } else {
    console.error(transferResult.err);
  }
}

async function createActor() {
  // Assuming you have the canister ID and the did file
  const canisterId = "your_canister_id";
  const idlFactory = IDL => { 
    return IDL.Service({
      getBalance: IDL.Func([IDL.Text], [IDL.Nat], ["query"]),
      transferTokens: IDL.Func([IDL.Text, IDL.Nat], [IDL.Text], []),
    });
   }; // Replace with your IDL factory

  await window.ic.plug.agent.fetchRootKey(); // Development only

  return await window.ic.plug.createActor({
    canisterId,
    interfaceFactory: idlFactory,
  });
}

// this is some changes
