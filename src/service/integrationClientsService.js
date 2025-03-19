const { baseHubSpot } = require("../../utis/basesApi");
const { responseClientsOmie } = require("../../utis/functions");

const integrationClientsService = async () => {
  let next = true;
  let pageNumber = 1;
  try {
    while (next) {
      const { pagging, totalPagging, ordersResponse } =
        await responseClientsOmie(pageNumber, 100);
      let fieldsToCreate = [];
      pageNumber++;

      console.log(ordersResponse.length);

      for (let i = 0; i <= ordersResponse.length; i++) {
        if (ordersResponse[i] !== undefined)
          fieldsToCreate.push(ordersResponse[i]);
        if (i === ordersResponse.length) {
          console.log("Resposta da criação", fieldsToCreate);
          const responseCreateProduct = await baseHubSpot
            .post(`crm/v3/objects/deals/batch/create`, {
              inputs: fieldsToCreate.filter((item) => item !== null),
            })
            .then((response) => response.data);
          fieldsToCreate = [];
        }
        console.log("entrou no for", fieldsToCreate.length, pageNumber);

        // if (i === ordersResponse.length - 1) resolve();
      }

      next = true;

      if (pageNumber > totalPagging) next = false;
    }
    return { message: "deu certo", status: 200 };
  } catch (error) {
    return error;
  }
};

module.exports = { integrationClientsService };
