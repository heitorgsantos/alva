const { baseHubSpot } = require("../../utis/basesApi");
const { responseProductsOmie } = require("../../utis/functions");

const integrationProductsService = async (data) => {
  // const responseCreateProduct = await baseHubSpot
  //   .post(`crm/v3/objects/products/batch/create`, { properties: responseOmie })
  //   .then((response) => response.data);
  let next = true;
  let pageNumber = 31;
  // const { pagging, totalPagging, responseOmie } = await responseProductsOmie(
  //   1,
  //   1530
  // );
  while (next) {
    const { pagging, totalPagging, responseOmie } = await responseProductsOmie(
      pageNumber,
      50
    );
    let fieldsToCreate = [];
    pageNumber++;

    for (let i = 0; i <= responseOmie.length; i++) {
      
      fieldsToCreate.push(responseOmie[i]);
      if (fieldsToCreate.length === 30) {
        const responseCreateProduct = await baseHubSpot
        .post(`crm/v3/objects/products/batch/create`, {
          inputs: fieldsToCreate,
        })
        .then((response) => response.data);
        console.log("Resposta da criação", responseCreateProduct);
        fieldsToCreate = [];
      }
      console.log("entrou no for", fieldsToCreate.length);

      // if (i === responseOmie.length - 1) resolve();
    }

    next = true;

    if (pageNumber > totalPagging) next = false;
    
  }
  return "BÂO";
};

module.exports = { integrationProductsService };
