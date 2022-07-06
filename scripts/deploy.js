const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const contract = await hre.ethers.getContractFactory("OAZIZ");

  console.log("start deploying");
  try {
    const Contract = await contract.deploy(
      "0x1E5dF0bC0db8424424BCA015d6ba1b7DB2CC15c6"
    );
    console.log("deployed");

    await Contract.deployed();

    console.log("Contract deployed to:", Contract.address);

    // const winners = [
    //   "0x4D1B61c3F9D8d51FC884A9b418fB7d4053CEE8BB",
    //   "0x597a57A2b77B7393D0726850943B74052189239d",
    //   "0x9807Ea7B016a45eCB6C3971f5E40320dED21A73c",
    //   "0xC8fe489b6EA2aa06b1A95CB78899AC6094b99782",
    //   "0x1E5dF0bC0db8424424BCA015d6ba1b7DB2CC15c6",
    //   "0x96130fBF714B1f2b79Fb9fC15ED2dF6646Df11e7",
    // ];

    const winners = ["0xa954669b3153677d4cc7754d258ab6ddac145630",
      "0xCdA29ff08464a66b1c8437e7dE780c1d02907688",
      "0x65ba4f92d7dfa813ddbd849d9faf38a723dd9b12",
      "0xCF842b0a840694985bEEBbe6e0248c6886b613b6",
      "0x17e0679e44849f819EB6646c41fAdc4396E3D731",
      "0x17e0679e44849f819EB6646c41fAdc4396E3D731",
      "0x17e0679e44849f819EB6646c41fAdc4396E3D731",
      "0x17e0679e44849f819EB6646c41fAdc4396E3D731",
      "0x17e0679e44849f819EB6646c41fAdc4396E3D731",
      "0x010D09DdD06776F28361556F02d3Cc137960876e",
      "0x010D09DdD06776F28361556F02d3Cc137960876e",
      "0xCF842b0a840694985bEEBbe6e0248c6886b613b6",
      "0x7Fac1Fe49dAB8c0bc203Cf12DD592b9f8CC49943",
      "0x8dF676ba0298b733C2311Cffa234de58849Eb678",
      "0x8dF676ba0298b733C2311Cffa234de58849Eb678",
      "0x6E3a788F38c80bF651D1e18b3D3a4862BB685499",
      "0xdA7E67a89Ae84D9f5cdB88ccCa509Dca8c4CddB1",
      "0x098e99ef1f52d4667ec629f2a5097f457a378eb1"];

    Contract.addWinnerAddress(winners);
  } catch (err) {
    console.log(err);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
