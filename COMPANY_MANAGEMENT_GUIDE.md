# 📋 Guia de Implementação - Gerenciamento de Empresa

## ✅ O que foi criado no Frontend

### 1. **Tipos TypeScript** (`src/types/CompanyTypes.ts`)
- `Category` - Categorias de despesa/receita personalizadas
- `CompanyParticipant` - Participantes/empregados
- `RecurringExpenseDistribution` - Despesas recorrentes distribuídas

### 2. **Componentes Vue**

#### **CategoryManager.vue** - Gerenciar Categorias
- ✅ Adicionar novas categorias (despesa/receita)
- ✅ Atribuir cores personalizadas
- ✅ Remover categorias
- ✅ Criar categorias dinâmicas que os usuários não conseguem alterar via tela de entrada/saída

**Recursos:**
- Separa categorias de Despesa e Receita
- Design intuitivo com cores personalizáveis
- Pronto para integração com backend

#### **ParticipantManager.vue** - Gerenciar Participantes/Empregados
- ✅ Adicionar novos participantes com dados completos
- ✅ Registrar nome, email, cargo, departamento e salário
- ✅ Busca por nome, email ou função
- ✅ Remover participantes
- ✅ Exibir total de salários da empresa

**Recursos:**
- Interface limpa com lista de participantes em cards
- Cálculo automático de total de salários
- Filtro de busca em tempo real
- Validação de campos obrigatórios

#### **RecurringExpenseManager.vue** - Distribuição de Despesas Recorrentes
- ✅ Criar despesas recorrentes (semanal, mensal, anual)
- ✅ Selecionar múltiplos participantes
- ✅ **Distribuição automática de valores** (divide igualmente entre selected)
- ✅ Edição individual de valores por participante
- ✅ Registrar datas de início e término
- ✅ Visualizar despesas criadas

**Exemplo de Uso:**
- Cria despesa de R$ 1.900 × 14 funcionários = R$ 26.600
- Distribui automático: R$ 26.600 / 14 = R$ 1.900 por funcionário
- Permite ajustes manuais se necessário

### 3. **View Atualizada** - CompanySettingsView.vue
Transformada em um **Painel Administrativo Completo** com:
- Informações gerais da empresa
- Acesso aos 3 gerenciadores
- Botão para sair da empresa
- Design responsivo

## 🔗 Endpoints do Backend Esperado

### **Categorias**
```typescript
POST   /api/categories
       Criar categoria
       Body: { name, type: 'income'|'expense', color?, description?, companyId }
       
GET    /api/categories?companyId=xxx
       Listar categorias da empresa
       
DELETE /api/categories/:id
       Remover categoria
```

### **Participantes**
```typescript
POST   /api/company/participants
       Adicionar participante
       Body: { name, email?, role, department?, salary?, joinDate?, companyId }
       
GET    /api/company/participants?companyId=xxx
       Listar participantes
       
DELETE /api/company/participants/:id
       Remover participante
```

### **Despesas Recorrentes**
```typescript
POST   /api/company/recurring-expenses
       Criar despesa recorrente
       Body: {
         description,
         totalAmount,
         frequency: 'weekly'|'monthly'|'yearly',
         startDate,
         endDate?,
         category?,
         participants: Array<{ participantId?, participantName, amount }>,
         companyId
       }
       
GET    /api/company/recurring-expenses?companyId=xxx
       Listar despesas recorrentes
       
DELETE /api/company/recurring-expenses/:id
       Remover despesa recorrente
```

## 🧪 Como Testar Localmente

### No Frontend:
1. Vá para **Configurações da Empresa** (CompanySettingsView)
2. Você verá 3 seções:
   - 📊 **Gerenciar Categorias** - Teste adicionar/remover
   - 👥 **Gerenciar Participantes** - Teste adicionar empregados
   - 💰 **Distribuição de Despesas** - Teste criar despesa recorrente

### Dados Pré-carregados (Mock):
- 10 categorias padrão (5 despesa / 5 receita)
- 4 participantes de exemplo
- Dados salvinhos localmente (localStorage) até sincronizar com backend

## 📝 Observações Importantes

✅ **FRONTEND PRONTO PARA RECEBER DO BACKEND:**
- Todos os formulários preparam dados no formato esperado
- Comentários mostram exatamente onde adicionar `axios.post()` ou `axios.delete()`
- Estrutura segue padrão REST

⚠️ **NÃO MEXIDO NO BACKEND:**
- Nenhuma mudança no backend foi feita
- Apenas preparado o frontend para consumir os endpoints

🔄 **PRÓXIMO PASSO:**
- Implementar endpoints no backend
- Descomente as chamadas `axios` nos componentes
- Teste integração end-to-end

## 📁 Arquivos Criados/Modificados

```
src/
  types/
    CompanyTypes.ts (NOVO)
  components/
    CompanyManagement/
      CategoryManager.vue (NOVO)
      ParticipantManager.vue (NOVO)
      RecurringExpenseManager.vue (NOVO)
  views/
    CompanySettingsView.vue (MODIFICADO)
```

---

**Todos os componentes seguem o padrão da aplicação (CSS, estrutura, validação)** ✨
