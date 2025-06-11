const { baseHubSpot } = require("../../utis/basesApi");
const {
  findCompany,
  formataData,
  formatEvent,
  queryCompanyCnpj,
  searchCompanyOmie,
} = require("../../utis/functions");
const { queryCompany } = require("../../utis/querys");
require("dotenv").config();

const PIPELINE = process.env.PIPELINE;
const DEALSTAGE = process.env.DEALSTAGE;

const handleClientSupplierIncluded = async ({
  cnpj_cpf,
  razao_social,
  codigo_cliente_omie,
  inativo,
}) => {
  const propertiesCompany = {
    properties: {
      cnpj: cnpj_cpf,
      name: razao_social,
      codigo_cliente_omie,
    },
  };

  try {
    const consultaCnpjHs = await findCompany(queryCompanyCnpj(cnpj_cpf));

    if (consultaCnpjHs.results.length > 0) {
      const { hs_object_id } = consultaCnpjHs.results[0].properties;

      if (inativo === "N") {
        const responseUpdateCompany = await baseHubSpot.patch(
          `crm/v3/objects/companies/${hs_object_id}`,
          { properties: { codigo_cliente_omie } }
        );
        return {
          status: responseUpdateCompany.status,
          message: responseUpdateCompany.data,
        };
      } else {
        return {
          status: 200,
          message: `Empresa ${razao_social} já existe e está inativa.`,
        };
      }
    } else {
      const responseCreateClient = await baseHubSpot.post(
        "crm/v3/objects/companies",
        propertiesCompany
      );
      return {
        status: responseCreateClient.status,
        message: responseCreateClient.data,
      };
    }
  } catch (error) {
    console.error(
      `Error in webHookCreateFieldsService for topic ${data.topic}:`,
      error.message,
      error.status ? `Status: ${error.status}` : ""
    );

    throw error;
  }
};

const handleProductSaleBilled = async ({
  dataFaturado,
  idCliente,
  idPedido,
  valorPedido,
  numeroPedido,
}) => {
  try {
    let companyId = null;
    const responseCompany = await findCompany(queryCompany(idCliente));
    if (responseCompany.results.length === 0) {
      const responseCompanyOmie = await searchCompanyOmie(idCliente);
      if (responseCompanyOmie !== "Não Encontrado") {
        const { cnpj_cpf, razao_social, codigo_cliente_omie } =
          responseCompanyOmie;
        const propertiesCompany = {
          properties: {
            cnpj: cnpj_cpf,
            name: razao_social,
            codigo_cliente_omie,
          },
        };

        const responseCreateClient = await baseHubSpot.post(
          "crm/v3/objects/companies",
          propertiesCompany
        );

        if (responseCreateClient.status === 201) {
          companyId = responseCreateClient.data.id;
        }
      }
    } else {
      companyId = responseCompany.results[0].id;
    }

    if (companyId) {
      companyId = responseCompany.results[0].id;

      const propertiesDeals = {
        properties: {
          pipeline: PIPELINE,
          dealstage: DEALSTAGE,
          dealname: `Pedido: ${numeroPedido}`,
          codigo_cliente: idCliente,
          codigo_pedido: idPedido,
          valor_total_pedido: valorPedido,
          amount: valorPedido,
          closedate: formataData(dataFaturado),
          numero_pedido: numeroPedido,
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

      const responseCreateDeal = await baseHubSpot.post(
        `crm/v3/objects/deals`,
        propertiesDeals
      );
      return {
        status: responseCreateDeal.status,
        message: responseCreateDeal.data,
      };
    } else {
      return {
        status: 404,
        message: `Empresa não encontrada para idCliente ${idCliente}.`,
      };
    }
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      message: error.response?.data || error.message,
    };
  }
};

const handleProductIncluded = async (event) => {
  try {
    const properties = formatEvent(event);
    const responseCreateProduct = await baseHubSpot.post(
      `crm/v3/objects/products`,
      properties
    );
    return {
      status: responseCreateProduct.status,
      message: responseCreateProduct.data,
    };
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      message: error.response?.data || error.message,
    };
  }
};

const webHookCreateFieldsService = async (data) => {
  const { topic, event } = data;

  console.log("Webhook: Dados Recebidos", data);

  try {
    switch (topic) {
      case "ClienteFornecedor.Incluido":
        if (
          event.cnpj_cpf &&
          (event.cnpj_cpf.length === 18 || event.cnpj_cpf.length === 14)
        ) {
          return await handleClientSupplierIncluded(event);
        } else {
          return { status: 400, message: "CNPJ/CPF inválido ou ausente." };
        }
      case "VendaProduto.Faturada":
        return await handleProductSaleBilled(event);
      case "Produto.Incluido":
        return await handleProductIncluded(event);
      default:
        return {
          status: 200,
          message: `Tópico "${topic}" não suportado ou sem ação necessária.`,
        };
    }
  } catch (error) {
    return {
      status: error.status || 500,
      message: `Erro interno no servidor: ${error.message}`,
    };
  }
};

module.exports = { webHookCreateFieldsService };
