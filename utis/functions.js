const { baseOmie, baseHubSpot } = require("./basesApi");
require("dotenv").config();
const APP_KEY = process.env.APP_KEY;
const APP_SECRET = process.env.APP_SECRET;
const PIPELINE = process.env.PIPELINE;
const DEALSTAGE = process.env.DEALSTAGE;

const responseProductsOmie = async (page, perPage) => {
  const params = {
    param: [
      {
        pagina: page,
        registros_por_pagina: perPage,
        apenas_importado_api: "N",
        filtrar_apenas_omiepdv: "N",
      },
    ],
    app_key: APP_KEY,
    app_secret: APP_SECRET,
    call: "ListarProdutos",
  };

  try {
    let pagging;
    let totalPagging;
    const responseOmie = await baseOmie
      .post("api/v1/geral/produtos/", params)
      .then((response) => {
        console.log(response.data.produto_servico_cadastro.length);
        pagging = response.data.pagina;
        totalPagging = response.data.total_de_paginas;

        return response.data.produto_servico_cadastro.map((produto, index) => {
          const recomendacoes_fiscais = produto.recomendacoes_fiscais;

          delete produto.recomendacoes_fiscais;
          delete produto.imagens;
          delete produto.info;
          produto.tipoitem = produto.tipoItem;
          delete produto.tipoItem;
          produto.codint_familia = produto.codInt_familia;
          delete produto.codInt_familia;
          produto.hs_sku = produto.codigo_produto;
          produto.name = produto.descricao;

          return {
            properties: {
              ...produto,
              ...recomendacoes_fiscais,
            },
          };
        });
      });

    return { pagging, totalPagging, responseOmie };
  } catch (error) {
    return error;
  }
};

const responseClientsOmie = async (page, perPage) => {
  const params = {
    param: [
      {
        pagina: page,
        registros_por_pagina: perPage,
        apenas_importado_api: "N",
      },
    ],
    app_key: APP_KEY,
    app_secret: APP_SECRET,
    call: "ListarPedidos",
  };

  try {
    let pagging;
    let totalPagging;
    let arrayDealProperties = [];
    let responseOmie = await baseOmie
      .post("api/v1/produtos/pedido/", params)
      .then(async (response) => {
        pagging = response.data.pagina;
        totalPagging = response.data.total_de_paginas;
        // console.log(response.data);
        return response.data.pedido_venda_produto.map((pedido) => {
          const {
            cabecalho: {
              codigo_cliente,
              codigo_empresa,
              codigo_pedido,
              data_previsao,
            },
            infoCadastro: { faturado },
            frete: { valor_frete },
            total_pedido: { valor_mercadorias, valor_total_pedido },
          } = pedido;
          if (faturado === "S") {
            const dealsProperties = {
              properties: {
                pipeline: PIPELINE,
                dealstage: DEALSTAGE,
                dealname: `Pedido: ${codigo_pedido}`,
                codigo_cliente,
                codigo_empresa,
                codigo_pedido,
                data_previsao: formataData(data_previsao),
                valor_frete,
                valor_mercadorias,
                valor_total_pedido,
                amount: valor_total_pedido,
              },
            };
            return dealsProperties;
          }
        });
      });
    const ordersResponse = responseOmie.filter((item) => item !== undefined);
    return { pagging, totalPagging, ordersResponse };
  } catch (error) {
    return error;
  }
};

const associationCompany = async (deals, baseApi) => {
  for (let index = 0; index < deals.length; index++) {
    console.log("INDEX", index);
    const item = deals[index];

  
    if (index >= deals.length) {
      resolve(); // Assuming resolve is defined somewhere in the scope
    }
  }
};

function formataData(data) {
  const splitData = data.split("/");
  const dataFormatada = `${splitData[2]}-${splitData[1]}-${splitData[0]}`;
  return dataFormatada;
}
console.log(formataData("12/03/2025"));
module.exports = {
  responseProductsOmie,
  responseClientsOmie,
  associationCompany,
};
