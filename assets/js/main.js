$(document).ready(function () {

  // Adiciona ou remove a classe 'scrolled' ao header com base na posição do scroll
  window.addEventListener('scroll', function () {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Alterna a classe 'navbar-mobile' para abrir/fechar o menu no modo mobile
  document.getElementById('mobile-nav-toggle').addEventListener('click', function () {
    document.getElementById('navbar').classList.toggle('navbar-mobile');
  });

  // Remove a classe 'navbar-mobile' para fechar o menu no modo mobile
  document.getElementById('close-nav').addEventListener('click', function () {
    document.getElementById('navbar').classList.remove('navbar-mobile');
  });

  // Fecha o menu no modo mobile ao clicar no link 'Consultar dados'
  document.querySelector('a[href="#input-section"]').addEventListener('click', function () {
    document.getElementById('navbar').classList.remove('navbar-mobile');
  });


  // Aplica máscara de CNPJ no input
  $('#cnpjInput').mask('00.000.000/0000-00');

  // Evento de clique para o botão de busca
  $('#searchButton').on('click', function () {
    const cnpj = $('#cnpjInput').val().replace(/\D/g, '');
    const errorContainer = $('#errorContainer');
    const errorMessage = $('#errorMessage');
    const loadingSpinner = $('#loadingSpinner');
    const resultContainer = $('#resultContainer');
    const partnersContainer = $('#partnersContainer');
    const buttonContainer = $('.button-container');

    // Limpar mensagem de erro anterior
    errorContainer.hide();
    errorMessage.text('');
    resultContainer.hide();
    partnersContainer.hide();
    buttonContainer.hide();

    if (cnpj === '' || cnpj.length !== 14) {
      errorMessage.text('Por favor, digite um CNPJ válido.');
      errorContainer.show();
      return;
    }

    // Mostrar o spinner de carregamento
    loadingSpinner.show();

    // Faz uma requisição à API do BrasilAPI com o CNPJ fornecido
    fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao buscar os dados.');
        }
        return response.json();
      })
      .then(data => {
        // Preenche os campos do formulário com os dados da empresa retornados pela API
        $('#companyCNPJ').val(data.cnpj || 'Não disponível').mask('00.000.000/0000-00');
        $('#companyName').val(data.nome_fantasia || 'Não disponível');
        $('#companySocialName').val(data.razao_social || 'Não disponível');
        $('#companyOpeningDate').val(formatDate(data.data_inicio_atividade) || 'Não disponível').mask('00/00/0000');
        $('#companyCapitalSocial').val(formatCurrency(data.capital_social) || 'Não disponível');
        $('#companyStatus').val(data.descricao_situacao_cadastral || 'Não disponível');
        $('#companyMEI').val(data.opcao_pelo_mei ? 'Sim' : 'Não');
        $('#companyActivity').val(data.cnae_fiscal_descricao || 'Não disponível');
        $('#companyAddress').val(`${data.descricao_tipo_de_logradouro || ''} ${data.logradouro || ''}, ${data.numero || ''}, ${data.bairro || ''} - ${data.municipio || ''} - ${data.uf || ''}`);
        $('#companyPhone').val(data.ddd_telefone_1 || 'Não disponível').mask('(00) 0000-0000');
        $('#companyEmail').val(data.email || 'Não disponível');

        // Mostrar os resultados após o atraso
        showResultsAfterDelay();

        // Preencher informações dos sócios
        if (data.qsa && data.qsa.length > 0) {
          $('#partnersDetails').empty();
          data.qsa.forEach((partner, index) => {
            const partnerHtml = `
                            <div class="result-fields">
                                <label for="partnerName${index}">Nome do Sócio:</label>
                                <input type="text" id="partnerName${index}" class="result-field" value="${partner.nome_socio || 'Não disponível'}" />
                            </div>
                            <div class="result-fields">
                                <label for="partnerCPF${index}">CPF/CNPJ do Sócio:</label>
                                <input type="text" id="partnerCPF${index}" class="result-field" value="${partner.cnpj_cpf_do_socio || 'Não disponível'}" />
                            </div>
                            <div class="result-fields">
                                <label for="partnerEntryDate${index}">Data de Entrada:</label>
                                <input type="text" id="partnerEntryDate${index}" class="result-field" value="${formatDate(partner.data_entrada_sociedade) || 'Não disponível'}" />
                            </div>
                        `;
            $('#partnersDetails').append(partnerHtml);
            if (index < data.qsa.length - 1) {
              $('#partnersDetails').append('<hr>');
            }
          });
          partnersContainer.show();
        }

        buttonContainer.show();
      })
      .catch(error => {
        errorMessage.text('Erro ao buscar os dados do CNPJ. Por favor, tente novamente.');
        errorContainer.show();
        console.error('Erro:', error);

        // Ocultar o spinner após o atraso em caso de erro
        setTimeout(() => {
          loadingSpinner.hide();
        }, 500);
      });

    function showResultsAfterDelay() {
      setTimeout(() => {
        resultContainer.show();
        loadingSpinner.hide();
      }, 500);
    }
  });


  // Funcionalidade para expandir/recolher a seção de resultados
  $('#toggleButton').on('click', function () {
    const resultDetails = $('#resultDetails');
    const toggleIcon = $('#toggleIcon');

    if (resultDetails.is(':visible')) {
      resultDetails.slideUp();
      toggleIcon.removeClass('bi-chevron-up').addClass('bi-chevron-down');
    } else {
      resultDetails.slideDown();
      toggleIcon.removeClass('bi-chevron-down').addClass('bi-chevron-up');
    }
  });

  // Funcionalidade para expandir/recolher a seção de sócios
  $('#togglePartnersButton').on('click', function () {
    const partnersDetails = $('#partnersDetails');
    const togglePartnersIcon = $('#togglePartnersIcon');

    if (partnersDetails.is(':visible')) {
      partnersDetails.slideUp();
      togglePartnersIcon.removeClass('bi-chevron-up').addClass('bi-chevron-down');
    } else {
      partnersDetails.slideDown();
      togglePartnersIcon.removeClass('bi-chevron-down').addClass('bi-chevron-up');
    }
  });

  // Submeter os dados
  $('#submitButton').on('click', function () {
    const formData = {
      cnpj: $('#companyCNPJ').val(),
      nome_fantasia: $('#companyName').val(),
      razao_social: $('#companySocialName').val(),
      data_inicio_atividade: $('#companyOpeningDate').val(),
      capital_social: $('#companyCapitalSocial').val(),
      descricao_situacao_cadastral: $('#companyStatus').val(),
      opcao_pelo_mei: $('#companyMEI').val(),
      cnae_fiscal_descricao: $('#companyActivity').val(),
      endereco: $('#companyAddress').val(),
      telefone: $('#companyPhone').val(),
      email: $('#companyEmail').val(),
      socios: []
    };

    // Limpar dados dos sócios antes de adicionar novos
  $('#partnersDetails .result-fields').each(function (index) {
    const partnerName = $(`#partnerName${index}`).val();
    const partnerCPF = $(`#partnerCPF${index}`).val();
    const partnerEntryDate = $(`#partnerEntryDate${index}`).val();;

    if (partnerName && partnerCPF && partnerEntryDate) {
      const partner = {
        nome_socio: partnerName,
        cnpj_cpf_do_socio: partnerCPF,
        data_entrada_sociedade: partnerEntryDate
      };
      formData.socios.push(partner);
    }
  });

  console.log('Dados submetidos:', formData);
  alert('Dados submetidos com sucesso!');
});

  // Gerar arquivo TXT
  $('#generateTxtButton').on('click', function () {
    let txtContent = `CNPJ: ${$('#companyCNPJ').val()}\n`;
    txtContent += `Nome Fantasia: ${$('#companyName').val()}\n`;
    txtContent += `Razão Social: ${$('#companySocialName').val()}\n`;
    txtContent += `Data de Abertura: ${$('#companyOpeningDate').val()}\n`;
    txtContent += `Capital Social: ${$('#companyCapitalSocial').val()}\n`;
    txtContent += `Situação Cadastral: ${$('#companyStatus').val()}\n`;
    txtContent += `Opção pelo MEI: ${$('#companyMEI').val()}\n`;
    txtContent += `Atividade: ${$('#companyActivity').val()}\n`;
    txtContent += `Endereço: ${$('#companyAddress').val()}\n`;
    txtContent += `Telefone: ${$('#companyPhone').val()}\n`;
    txtContent += `Email: ${$('#companyEmail').val()}\n\n`;

    txtContent += `Sócios:\n`;
    const partners = $('#partnersDetails .result-fields');
    let hasPartners = false;
  
    partners.each(function (index) {
      const partnerName = $(`#partnerName${index}`).val();
      const partnerCPF = $(`#partnerCPF${index}`).val();
      const partnerEntryDate = $(`#partnerEntryDate${index}`).val();
  
      if (partnerName && partnerCPF && partnerEntryDate) {
        txtContent += `Nome do Sócio: ${partnerName}\n`;
        txtContent += `CPF/CNPJ do Sócio: ${partnerCPF}\n`;
        txtContent += `Data de Entrada: ${partnerEntryDate}\n`;
        txtContent += `\n`;
        hasPartners = true;
      }
    });
  
    if (!hasPartners) {
      txtContent += `Não há sócios cadastrados.\n`;
    }
  
    const blob = new Blob([txtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dados_empresa.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  
  function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }

  function formatCurrency(value) {
    if (!value) return '';
    return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
});

// Função para incrementar o número de consultas
function incrementarConsultas() {
  const consultasElement = document.getElementById('consultas-hoje');
  let consultas = parseInt(consultasElement.innerText.replace('.', ''));
  consultas += Math.floor(Math.random() * 5) + 1;
  consultasElement.innerText = consultas.toLocaleString('pt-BR');
}

// Incrementa o número de consultas a cada 2 segundos
setInterval(incrementarConsultas, 2000);


