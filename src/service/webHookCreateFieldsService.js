const { baseHubSpot } = require("../../utis/basesApi");
const {
  findCompany,
  formataData,
  formatEvent,
} = require("../../utis/functions");
const { queryCompany } = require("../../utis/querys");
require("dotenv").config();
const PIPELINE = process.env.PIPELINE;
const DEALSTAGE = process.env.DEALSTAGE;

const webHookCreateFieldsService = async (data) => {
  const { topic } = data;

  console.log("Dados Recebidos", data)
  if (topic === "ClienteFornecedor.Incluido" && data.event.cnpj_cpf.length === 18) {
    console.log("Empresa Incluida")
    const {
      event: { cnpj_cpf, razao_social, codigo_cliente_omie },
    } = data;
    const propertiesCompany = {
      properties: {
        cnpj: cnpj_cpf,
        name: razao_social,
        codigo_cliente_omie,
      },
    };
    try {
      const responseCreateClient = await baseHubSpot
        .post("crm/v3/objects/companies", propertiesCompany)
        .then((response) => response);
      if (responseCreateClient.status === 201)
        return { status: 201, message: responseCreateClient.data };
    } catch (error) {
      return error;
    }
  }

  if (topic === "VendaProduto.Faturada") {
    const {
      event: { dataFaturado, idCliente, idPedido, valorPedido },
    } = data;
    console.log("Venda faturada");
    try {
      const responseCompany = await findCompany(queryCompany(idCliente));

      if (responseCompany?.results.length > 0) {
        const companyId = responseCompany.results[0].id;
        console.log("Resposta empresa", companyId);
        const propertiesDeals = {
          properties: {
            pipeline: PIPELINE,
            dealstage: DEALSTAGE,
            dealname: `Pedido: ${idPedido}`,
            codigo_cliente: idCliente,
            codigo_pedido: idPedido,
            valor_total_pedido: valorPedido,
            amount: valorPedido,
            closedate: formataData(dataFaturado),
          },
          associations: [
            {
              types: [
                {
                  associationCategory: "HUBSPOT_DEFINED",
                  associationTypeId: 5,
                },
              ],
              to: {
                id: companyId,
              },
            },
          ],
        };

        const responseCreateDeal = await baseHubSpot
          .post(`crm/v3/objects/deals`, propertiesDeals)
          .then((response) => response);
        if (responseCreateDeal.status === 201) {
          return { status: 201, message: responseCreateDeal.data };
        }
      }
    } catch (error) {
      return error;
    }
  }

  if (topic === "Produto.Incluido") {
    const { event } = data;
    const properties = formatEvent(event);
    const responseCreateProduct = await baseHubSpot
    .post(`crm/v3/objects/products`, properties)
    .then((response) => response);
    console.log(responseCreateProduct.status)
    if (responseCreateProduct.status === 201) {
      return { status: 201, message: responseCreateProduct.data };
    }
    return { status: 400, message:  responseCreateProduct.data};
  }

  return { status: 200, message: data };
};

module.exports = { webHookCreateFieldsService };
