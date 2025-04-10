const { returnId } = require("../../produtos");
const { baseHubSpot } = require("../../utis/basesApi");
const { returnProductsAssociatedsDeals } = require("../../utis/functions");

const associationsProductsWithDealsService = async () => {
  // returnId;
  // console.log(returnId);
  // const responseProducts = await baseHubSpot
  //   .post("/crm/v3/objects/products/batch/read", {
  //     inputs: returnId,
  //     idProperty: "hs_sku",
  //     properties: ["codigo_produto"],
  //   })
  //   .then((response) => response.data.results);

  // if (responseProducts.length > 0) {
  //   responseProducts.forEach(({ properties }) => console.log(properties));
  // }


  let next = true;
  let pageNumber = 1;
  try {
    while (next) {
      const { pagging, totalPagging, ordersResponse } =
        await returnProductsAssociatedsDeals(pageNumber, 100);
      let fieldsToCreate = [];
      pageNumber++;

      next = true;

      if (pageNumber > totalPagging) next = false;
    }
    return { message: "deu certo", status: 200 };
  } catch (error) {
    return error;
  }
};

module.exports = { associationsProductsWithDealsService };
