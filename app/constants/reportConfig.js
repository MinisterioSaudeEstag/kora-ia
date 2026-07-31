export const REPORT_CONFIG = {
  sections: [
    {
      id: 'sec0',
      title: 'Aba Dados',
      roman: 'I',
      type: 'DATA_ENTRY',
      description: 'A introdução do relatório identifica o convênio, as partes envolvidas, os valores e o período de vigência.',
      fields: [
        {
          id: 'numeroConvenio',
          label: 'Nº DO CONVÊNIO/ANO (Atenção: No documento do Transferegov pode aparecer como "Código do Instrumento", "Instrumento" ou "Número da Proposta")',
          placeholder: '000/0000'
        },
        {
          id: 'entidadeConveniente',
          label: 'NOME DA ENTIDADE CONVENIENTE (Pode aparecer logo após o CNPJ ou sob o campo "Proponente")',
          placeholder: 'Nome da Entidade'
        },
        {
          id: 'objetoConvenio',
          label: 'OBJETO DO CONVÊNIO EM MAIÚSCULAS (Se não houver o campo "Objeto", busque a descrição em "Justificativa" ou "Caracterização dos Interesses")',
          placeholder: 'DESCRIÇÃO...'
        },
        { id: 'valorGlobal', label: 'VALOR GLOBAL', placeholder: 'R$ 0,00' },
        { id: 'valorConcedente', label: 'VALOR CONCEDENTE', placeholder: 'R$ 0,00' },
        { id: 'valorContrapartida', label: 'VALOR CONTRAPARTIDA', placeholder: 'R$ 0,00' },
        { id: 'valorExecutado', label: 'VALOR EXECUTADO', placeholder: 'R$ 0,00' },
        { id: 'dataInicio', label: 'DATA INÍCIO (DD/MM/AAAA)', placeholder: 'DD/MM/AAAA' },
        { id: 'dataFim', label: 'DATA FIM (DD/MM/AAAA)', placeholder: 'DD/MM/AAAA' },
        { id: 'numeroOficio', label: 'NÚMERO DO OFÍCIO CIRCULAR (SEI)', placeholder: 'SEI nº...' },
        { id: 'notaTecnica', label: 'NOTA TÉCNICA N.', placeholder: 'Nº/ANO-COACOM...' },
      ]
    },
    {
      id: 'sec1',
      title: 'Questionário Financeiro',
      roman: 'II',
      type: 'QUESTIONNAIRE',
      questions: [
        { id: 'q1', text: 'O objeto do convênio está sendo/foi executado de acordo com as metas e fases de execução previstas no Plano de Trabalho e/ou no Projeto Básico?', model: 'O objeto do convênio foi executado de acordo com a [META] meta(s) e [ETAPA] etapa(s) de execução previstas no Plano de Trabalho...', hint: 'Plano de Trabalho → Crono Físico: quantidade de metas e etapas, data de início e término. Plano de trabalho → Plano de Aplicação Detalhado: quantidade de equipamentos = somatório das unidades.' },
        { id: 'q2', text: 'O objeto do convênio está sendo/foi executado de acordo com o cronograma de execução previsto no Plano de Trabalho e/ou no Projeto Básico?', model: 'Resposta igual ao Item 1.', hint: 'Referenciar as mesmas informações do Crono Físico e Plano de Aplicação Detalhado.' },
        { id: 'q3', text: 'O(s) preço(s) praticado(s) na execução do convênio estão de acordo com o Plano de Trabalho aprovado?', model: 'A execução física foi de [XX%] com a aquisição de [todos/X] equipamentos previstos...', hint: 'Equipamentos adquiridos / equipamentos aprovados * 100 = % de execução física.' },
        { id: 'q4', text: 'A contrapartida foi depositada na conta específica do convênio ou contrato de repasse, classificada e registrada conforme pactuação?', model: 'Sim ou Não', hint: 'Relatórios Financeiros de Aceite de Licitação → Aba Acompanhamento Relatório Instrumento – Acompanhamento.' },
        { id: 'q5', text: 'Existe alguma receita de aplicação financeira computada como contrapartida?', model: 'O valor de R$ [VALOR] corresponde ao rendimento da contrapartida depositada integralmente pelo convenente em [DATA].', hint: 'Aba Saldo Remanescente da Prestação de Contas e extrato bancário.' },
        { id: 'q6', text: 'A efetivação da contrapartida observou os prazos previstos no cronograma de desembolso?', model: 'A contrapartida foi depositada em [DATA] no valor de R$ [VALOR], sendo o mesmo mês de liberação do recurso pelo Ministério da Saúde.', hint: 'Verificar informações dos itens 4 e 5.' },
        { id: 'q7', text: 'Os recursos foram/estão sendo aplicados no mercado financeiro?', model: 'A transferência efetivada pelo FNS/MS foi movimentada na conta específica do Convênio, Agência [AGÊNCIA] e Conta Corrente [CONTA] no [BANCO] no valor de R$ [VALOR] em [DATA] e aplicado no [FUNDO].', hint: 'Aba Saldo Remanescente da Prestação de Contas e extrato bancário.' },
        { id: 'q8', text: 'Recursos com previsão de uso superior a 30 dias foram aplicados em caderneta de poupança?', model: 'Sim ou Não', hint: 'Extratos bancários inseridos no processo.' },
        { id: 'q9', text: 'Recursos com previsão de uso inferior a 30 dias foram aplicados em fundo de aplicação financeira de curto prazo ou operação de mercado aberto?', model: 'Sim ou Não', hint: 'Extratos bancários inseridos no processo.' },
        { id: 'q10', text: 'Foram pagos valores a título de taxa de administração, gerência ou similar?', model: 'Sim ou Não', hint: 'Extratos bancários e TGOV.' },
        { id: 'q11', text: 'Foram destinados recursos para taxas bancárias, multas, juros ou correção monetária?', model: 'Sim ou Não', hint: 'Extratos bancários e TGOV.' },
        { id: 'q12', text: '(Se Q11 = SIM) Houve autorização da concedente para esses pagamentos?', model: 'Sim ou Não / Não se aplica', hint: 'Extratos bancários e TGOV.' },
        { id: 'q13', text: 'Notificação de partidos, sindicatos e entidades empresariais sobre liberação de recursos (entes municipais/DF)?', model: 'NÃO SE APLICA (para entidades privadas)', hint: 'Aplicável apenas a entes municipais e DF.' },
        { id: 'q14', text: 'A movimentação foi/está sendo realizada em conta corrente específica do convênio?', model: 'A transferência efetivada pelo FNS/MS foi movimentada na conta específica do Convênio, Banco nº [CÓDIGO], Agência [AGÊNCIA] e Conta Corrente [CONTA].', hint: 'Dados levantados na Q7.' },
        { id: 'q15', text: '(Se Q14 = SIM) Houve movimentação de valores estranhos à execução do objeto na conta bancária específica?', model: 'Sim ou Não (se sim, descrever detalhadamente)', hint: 'Extrato bancário.' },
        { id: 'q16', text: 'Autorização de OBTV?', model: 'Sim ou Não', hint: 'Execução → Limites OBTV para Convenente.' },
        { id: 'q17', text: 'Pagamentos direto no caixa?', model: 'Sim ou Não', hint: 'Normalmente não se aplica.' },
        { id: 'q21', text: 'Os pagamentos estão suportados por comprovantes de despesas no mesmo valor?', model: 'Os documentos comprobatórios das despesas estão descritos na Planilha de Equipamentos na aba Dados.', hint: 'Planilha de Equipamentos.' },
        { id: 'q22', text: 'Houve pagamento fora do prazo de vigência do convênio?', model: 'O final da vigência foi em [DATA] e o pagamento da última despesa foi em [DATA].', hint: 'Extrato bancário e data de vigência.' },
        { id: 'q23', text: '(Se Q22 = SIM) Houve autorização da concedente para pagamento fora do prazo?', model: 'NÃO (Concedente nunca autoriza)', hint: 'Extrato bancário.' },
        { id: 'q24', text: 'As despesas foram executadas de acordo com as classificações do Plano de Aplicação?', model: 'Natureza da despesa – [CÓDIGO].', hint: 'Plano de Trabalho → Plano de Aplicação Detalhado.' },
        { id: 'q25', text: 'A execução das despesas cumpriu os preceitos legais?', model: 'Sim ou Não (se não, descrever irregularidade)', hint: 'Documentos comprobatórios e preceitos legais.' },
        { id: 'q26', text: 'A documentação comprobatória das despesas está identificada com o número e título do convênio?', model: 'Sim ou Não', hint: 'Verificar se nas Notas Fiscais consta o número do convênio.' },
        { id: 'q27', text: 'Os extratos bancários demonstram o correto pagamento das despesas do convênio?', model: 'Os extratos apresentados compreenderam o período de [MÊS/ANO] a [MÊS/ANO] e demonstraram o cumprimento da legislação.', hint: 'Extratos bancários.' },
        { id: 'q28', text: 'Os documentos sobre a execução do convênio foram disponibilizados de forma integral?', model: 'Sim ou Não (se não, descrever documentos ausentes)', hint: 'Análise da documentação.' },
        { id: 'q29', text: 'O recolhimento do saldo do convênio ocorreu em tempo hábil?', model: 'A Prestação de Contas foi enviada em [DATA] com recolhimento do saldo remanescente em [DATA] no valor de R$ [VALOR].', hint: 'Aba Saldo Remanescente.' },
        { id: 'q30', text: 'O saldo está conciliado?', model: 'Receitas totais: R$ [VALOR]... Despesas totais: R$ [VALOR]... Saldo em [DATA] está conciliado.', hint: 'Prestação de contas, extrato bancário e planilha de conciliação.' },
      ]
    },
    {
      id: 'sec2',
      title: 'PAD Financeiro',
      roman: 'III',
      type: 'DATA_ENTRY',
      description: 'Descrição das Notas Fiscais e conformidade das aquisições de equipamentos.',
      fields: [
        {
          id: 'padFinanceiroAbertura',
          label: 'Texto de Abertura: Gerar a justificativa usando exatamente o padrão: "As Notas Fiscais/Documentações descritas na ABA – PAD Financeiro demonstram conformidade das aquisições em relação ao Plano de Trabalho Aprovado. Conforme. Justificativa: [Escreva a justificativa de conformidade baseada nos documentos]." ',
          placeholder: 'As Notas Fiscais/Documentações descritas na ABA – PAD Financeiro demonstram...'
        },
        {
          id: 'padFinanceiroEquipamentos',
          label: 'Lista de Equipamentos Adquiridos: Para CADA equipamento identificado no documento/proposta, formate EXATAMENTE conforme o exemplo:\n\n[Nome do Equipamento]\nQuantidade aprovada: [Número]\nValor unitário adquirido: R$ [Valor]\nValor total de aquisição: R$ [Valor]\n\n(Se houver mais de um equipamento, repita este bloco para cada um deles).',
          placeholder: 'Monitor Multiparâmetros...\nQuantidade aprovada: 1\nValor unitário adquirido: R$ 17.999,90\nValor total de aquisição: R$ 17.999,90'
        },
      ]
    },
    {
      id: 'sec3',
      title: 'Questionário Físico',
      roman: 'IV',
      type: 'QUESTIONNAIRE',
      questions: [
        { id: 'f1', text: 'As etapas foram/estão sendo executadas de acordo com a quantidade e períodos programados?', model: 'Os itens foram adquiridos de acordo com o plano de trabalho.', hint: 'Se não, identificar divergências.' },
        { id: 'f2', text: 'O objeto do convênio está sendo/foi executado na mesma localidade e endereço especificados?', model: 'Os itens adquiridos estão localizados na unidade de saúde definida no plano de trabalho.', hint: 'Verificação de localização de GPS e endereço.' },
        { id: 'f3', text: 'A fornecedora que está realizando o objeto é a mesma que celebrou o contrato?', model: 'O pagamento foi realizado para o respectivo fornecedor conforme planilha anexa.', hint: 'Verificar contrato na plataforma.' },
        { id: 'f4', text: 'O objeto obteve aprovação das instâncias legais pertinentes?', model: 'NÃO SE APLICA', hint: 'Destinado a convênios de obra.' },
        { id: 'f5', text: 'Foi utilizado algum tipo de identificação para promover a publicidade?', model: 'Há plaquetas com Patrimônio e a identificação do convênio.', hint: 'Verificar placas e identificações.' },
        { id: 'f6', text: 'Informações e locais de execução estão à disposição para acesso?', model: 'SIM', hint: 'Documentos disponíveis no TGOV.' },
      ]
    },
    {
      id: 'sec4',
      title: 'Crono Físico',
      roman: 'V',
      type: 'DATA_ENTRY',
      description: 'Percentual de execução física.',
      fields: [
        {
          id: 'execucaoFisica',
          label: 'Calcule e informe o percentual executado usando o modelo: "A execução física foi de [XX]% com a aquisição de [todos os / X dos] equipamentos previstos com preço [inferior / superior / igual] ao presente no plano de trabalho, conforme Planilha de Equipamentos em Anexo na Aba Dados deste Relatório." DICA: Equipamentos adquiridos dividido por equipamentos aprovados vezes 100.',
          placeholder: 'A execução física foi de [XX%] com a aquisição de...'
        },
      ]
    },
    {
      id: 'sec5',
      title: 'PAD Físico',
      roman: 'VI',
      type: 'DATA_ENTRY',
      description: 'Resultado da análise de conformidade física.',
      fields: [
        {
          id: 'resultadoPadFisico',
          label: 'Descreva o resultado da análise usando o modelo: "[Conforme / Não conforme]. [Não foram identificadas inconformidades na execução desse item. / DESCREVER AS INCONFORMIDADES ENCONTRADAS]". Orientação: Se não conforme, descrever detalhadamente cada item em desacordo.',
          placeholder: 'Conforme / Não conforme. Descrever inconformidades...'
        },
      ]
    },
    {
      id: 'sec6',
      title: 'Processos de Licitação',
      roman: 'VII',
      type: 'QUESTIONNAIRE',
      questions: [
        { id: 'l1', text: 'O prazo de execução está compatível com o edital e contrato?', model: 'O Convênio esteve vigente entre [DATA] e [DATA]. Contrato nº [XX]... recebidos em [DATA] (dentro/após o prazo).', hint: 'Verificar sequência cronológica obrigatória: Edital → Propostas → Homologação → NF → Pagamento.' },
        { id: 'l2', text: 'O prazo estabelecido para o certame foi obedecido?', model: 'Todos os prazos das etapas para realização do processo licitatório foram cumpridos.', hint: 'Análise de datas do certame.' },
        { id: 'l3', text: 'O convenente forneceu declaração expressa de atendimento às disposições legais?', model: 'O Parecer Jurídico foi assinado em [DATA]. O certame foi homologado em [DATA]... Declaração assinada em [DATA].', hint: 'Mencionar Parecer Jurídico, Homologação, DOU e Declarações com as datas.' },
        { id: 'l4', text: 'Os preços propostos possuem compatibilidade com os preços de referência?', model: 'As despesas estão descritas na Planilha de equipamentos na aba Dados deste relatório.', hint: 'SIM: preços licitados menores ou iguais aos preços do plano de trabalho. NÃO: listar itens com preços superiores.' },
        { id: 'l5', text: 'Existe enquadramento entre o objeto conveniado e o efetivamente licitado?', model: 'Quanto à análise, sua execução física foi realizada por meio da NOTA TÉCNICA Nº [XX]. Foi apresentado o Parecer de avaliação...', hint: 'Mencionar parecer da engenharia clínica / declaração de compatibilidade / nota técnica com datas.' },
      ]
    },
    {
      id: 'sec7',
      title: 'Conclusão',
      roman: 'VIII',
      type: 'DATA_ENTRY',
      description: 'Resumo final, constatações e recomendações.',
      fields: [
        { id: 'percentuaisFinais', label: 'Percentuais de Execução Física e Financeira', placeholder: '[XX%] Física e [XX%] Financeira' },
        { id: 'constatacoes', label: 'Constatações (C1)', placeholder: 'Descrever irregularidades ou registrar que não foram identificadas.' },
        { id: 'recomendacoesGerais', label: 'Recomendação obrigatória em todos os relatórios', placeholder: 'Orientamos cadastrar os equipamentos no SCNES...' },
        { id: 'recomendacoesEspecificas', label: 'Demais Recomendações (C2)', placeholder: 'Recomendações correspondentes a cada constatação.' },
      ]
    },
  ]
};