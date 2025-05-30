const { baseHubSpot } = require("../../utis/basesApi");
const {
  findCompany,
  formataData,
  formatEvent,
  queryCompanyCnpj,
} = require("../../utis/functions"); 
const { queryCompany } = require("../../utis/querys");
require("dotenv").config();

const PIPELINE = process.env.PIPELINE;
const DEALSTAGE = process.env.DEALSTAGE;

const handleClientSupplierIncluded = async ({ cnpj_cpf, razao_social, codigo_cliente_omie, inativo }) => {
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
        console.log(`Empresa ${razao_social} (ID: ${hs_object_id}) atualizada na HubSpot.`);
        return {
          status: responseUpdateCompany.status,
          message: responseUpdateCompany.data,
        };
      } else {
        console.log(`Empresa ${razao_social} (ID: ${hs_object_id}) já existe e está inativa. Nenhuma ação realizada.`);
        return {
          status: 200, 
          message: `Empresa ${razao_social} já existe e está inativa.`,
        };
      }
    } else {
      const responseCreateClient = await baseHubSpot.post("crm/v3/objects/companies", propertiesCompany);
      console.log(`Nova empresa ${razao_social} criada na HubSpot. ID: ${responseCreateClient.data.id}`);
      return { status: responseCreateClient.status, message: responseCreateClient.data };
    }
  } catch (error) {
    console.error(`Erro ao processar ClienteFornecedor.Incluido para CNPJ ${cnpj_cpf}:`, error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      message: error.response?.data || error.message,
    }; 
  }
};


const handleProductSaleBilled = async ({ dataFaturado, idCliente, idPedido, valorPedido }) => {
  try {
    const responseCompany = await findCompany(queryCompany(idCliente));

    if (responseCompany?.results.length > 0) {
      const companyId = responseCompany.results[0].id;
      console.log(`Empresa encontrada na HubSpot para idCliente ${idCliente}. ID: ${companyId}`);

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

      const responseCreateDeal = await baseHubSpot.post(`crm/v3/objects/deals`, propertiesDeals);
      console.log(`Negócio para o Pedido ${idPedido} criado na HubSpot. ID: ${responseCreateDeal.data.id}`);
      return { status: responseCreateDeal.status, message: responseCreateDeal.data };
    } else {
      console.warn(`Empresa não encontrada na HubSpot para idCliente ${idCliente}. Não foi possível criar o negócio.`);
      return { status: 404, message: `Empresa não encontrada para idCliente ${idCliente}.` };
    }
  } catch (error) {
    console.error(`Erro ao processar VendaProduto.Faturada para Pedido ${idPedido}:`, error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      message: error.response?.data || error.message,
    };
  }
};


const handleProductIncluded = async (event) => {
  try {
    const properties = formatEvent(event); 
    const responseCreateProduct = await baseHubSpot.post(`crm/v3/objects/products`, properties);
    console.log(`Produto ${properties.properties.name} criado na HubSpot. ID: ${responseCreateProduct.data.id}`);
    return { status: responseCreateProduct.status, message: responseCreateProduct.data };
  } catch (error) {
    console.error(`Erro ao processar Produto.Incluido:`, error.response?.data || error.message);
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
        if (event.cnpj_cpf && (event.cnpj_cpf.length === 18 || event.cnpj_cpf.length === 14)) {
          return await handleClientSupplierIncluded(event);
        } else {
          console.warn(`Webhook: ClienteFornecedor.Incluido recebido com CNPJ/CPF inválido: ${event.cnpj_cpf}`);
          return { status: 400, message: "CNPJ/CPF inválido ou ausente." };
        }
      case "VendaProduto.Faturada":
        return await handleProductSaleBilled(event);
      case "Produto.Incluido":
        return await handleProductIncluded(event);
      default:
        console.warn(`Webhook: Tópico "${topic}" não reconhecido. Nenhum processamento realizado.`);
        return { status: 200, message: `Tópico "${topic}" não suportado ou sem ação necessária.` };
    }
  } catch (error) {
    // Captura erros lançados pelas funções auxiliares
    console.error("Erro geral no serviço de webhook:", error);
    return {
      status: error.status || 500,
      message: `Erro interno no servidor: ${error.message}`,
    };
  }
};

module.exports = { webHookCreateFieldsService };