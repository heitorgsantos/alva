const { baseHubSpot } = require("../../utis/basesApi");
const {
  responseClientsOmie,
  associationCompany,
} = require("../../utis/functions");

const associationService = async () => {
  const queryDeals = {
    properties: ["hs_object_id", "codigo_cliente"],
    limit: 100,
    filterGroups: [
      {
        filters: [
          {
            propertyName: "controle",
            operator: "NOT_HAS_PROPERTY",
          },
          {
            propertyName: "codigo_cliente",
            operator: "HAS_PROPERTY",
          },
        ],
      },
    ],
  };

  const { results } = await baseHubSpot
    .post(`crm/v3/objects/deals/search`, queryDeals)
    .then(async (response) => {
      // console.log("Consulta do Negócio", response.data);
      return response.data;
    })
    .catch((error) => error.message);
  // console.log("Results", results);

  let nextPage;
  const responseDeals = await associationCompany(results, baseHubSpot);
  console.log("Depois da Promise", responseDeals);

  nextPage = true;
  // let newPage = after;
  while (nextPage) {
    nextPage = false;
    await baseHubSpot
      .post(`crm/v3/objects/deals/search`, queryDeals)
      .then(async (response) => {
        // console.log("Resposta da Próxima Página", response.data);
        const { results } = response.data;
        if (results.length > 0) nextPage = true;

        console.log("Log NewPage", nextPage);

        await associationCompany(results, baseHubSpot);
        return response.data;
      })
      .catch((error) => error.message);
  }
  return "Correção de E-mails finalizada!";
};

module.exports = { associationService };
