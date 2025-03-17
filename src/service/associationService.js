const { baseHubSpot } = require("../../utis/basesApi");
const { responseClientsOmie } = require("../../utis/functions");

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
        ],
      },
    ],
  };

  const {
    results,
    paging: {
      next: { after },
    },
  } = await baseApi
    .post(`crm/v3/objects/deals/search`, queryDeals)
    .then(async (response) => {
      // console.log("Consulta do Negócio", response.data);
      return response.data;
    })
    .catch((error) => error.message);

  console.log("Results", results);

  //let nextPage;
  //const responseDeals = await filterDealsWithEmails(results, baseApi);
  // console.log("Depois da Promise", responseDeals);

  // if (after) nextPage = true;
  // let newPage = after;
  // while (nextPage) {
  //   console.log("Log NewPage", newPage, nextPage);
  //   nextPage = false;
  //   await baseApi
  //     .get(`crm/v3/objects/companies?limit=100&after=${newPage}`)
  //     .then(async (response) => {
  //       console.log("Resposta da Próxima Página", response.data);
  //       const {
  //         results,
  //         paging: {
  //           next: { after },
  //         },
  //       } = response.data;
  //       if (after) nextPage = true;
  //       newPage = after;
  //       console.log("Log NewPage", newPage, nextPage);

  //       await filterDealsWithEmails(results, baseApi);
  //       return response.data;
  //     })
  //     .catch((error) => error.message);
  // }
  return "Correção de E-mails finalizada!";
};

module.exports = { associationService };
