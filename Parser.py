import sys


def Parser(question):
    newQuestion = question + ' '

    digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    
    #Converts all instances of ** to the LaTex equivalent ^
    newQuestion = newQuestion.replace("**", "^")
    
    #Places all numerical exponential arguments within a set of brackets { }
    for i, char in enumerate(newQuestion):
        if char == '^' and i + 1 != len(newQuestion):
            if newQuestion[(i + 1)] in digits:
                k = 1
                j = i + 1
                while (newQuestion[j] in digits) and j < len(newQuestion):
                    j += 1

                newQuestion = newQuestion[:(i+1)] + '{' + newQuestion[(i+1):]
                newQuestion = newQuestion[:j+1] + '}' + newQuestion[j+1:]

    #Places all exponential expressions deliminated by parentheses within brackets
    for i, char in enumerate(newQuestion):
        if char == '^' and i + 1 != len(newQuestion):
            if newQuestion[(i + 1)] == '(':
                k = 1
                j = i + 2
                while k != 0 and j < len(newQuestion):

                    if newQuestion[j] == '(':
                        k += 1
                    if newQuestion[j] == ')':
                        k -= 1
                    j += 1

                newQuestion = newQuestion[:(i+1)] + '{' + newQuestion[(i+2):]
                newQuestion = newQuestion[:(j-1)] + '}' + newQuestion[j:]

    #Replaces all fractions of the form a/b with the equivalent \\frac{a}{b}
    tempQuestion = newQuestion
    for i, char in enumerate(newQuestion):
       if char == '/' and i + 1 != len(newQuestion):
           j = i - 1
           k = i + 1
           b = 0
           p = 0
           numeratorOld = ""
           denominatorOld = ""
           while (newQuestion[j] not in ['+', '-', '/', '*', '{', '(', ' ', '.'] or (p > 0 or b > 0) ) and j >= 0:               
               numeratorOld = newQuestion[j] + numeratorOld
               b += int(newQuestion[j] == '}') - int(newQuestion[j] == '{')
               p += int(newQuestion[j] == ')') - int(newQuestion[j] == '(') 
               j -= 1
          
           b = 0
           p = 0
           while (newQuestion[k] not in ['+', '-', '/', '*', '}', ')', ' ', '.'] or (p > 0 or b > 0) ) and k < len(newQuestion)-1:
               denominatorOld += newQuestion[k]
               b += int(newQuestion[k] == '{') - int(newQuestion[k] == '}')
               p += int(newQuestion[k] == '(') - int(newQuestion[k] == ')')
               k += 1
           
           numerator = newQuestion[j+1:i:]
           denominator = newQuestion[i+1:k]
           oldFraction = numeratorOld + '/' + denominatorOld
           newFraction = '\\frac{' + numerator + '}{' + denominator + '}'
           tempQuestion = tempQuestion.replace(oldFraction, newFraction, 1)       
    newQuestion = tempQuestion
    
    #Replaces all deliminating parantheses with formatted LaTex verions
    newQuestion = newQuestion.replace("(","\\left(")
    newQuestion = newQuestion.replace(")","\\right)")

    #Determines which expressions to render in LaTex code and which to render as normal text
    words = newQuestion.split()
    
    #
    testList = ['suppose', 'let', 'assume', 'integer','solve','for', 'simplify',
               'what', 'is', 'the', 'next', 'term', 'of', 'in', 'determine',
               'in', 'base', 'put', 'and', 'together', 'calculate', 'divided', 'by'
               'times', 'Evaluate', 'to', 'nearest', 'distance', 'between','value'
               'cude','root','add','third','derivitive','find','second', 'wrt'
               'smallest','decreasing','increasing', 'closest', 'seventh',
               'biggest','greatest', 'or', 'descending','order','closest','closet'
               'which','how','many','centimeters', 'there', 'millimeters'
               'minutes', 'before', 'convert', 'nanoseconds', 'how', 'many', 'hours', 'are'
               'hours', 'are', 'fourty-one', 'halves', 'a', 'week','many',
               'remainder','highest', 'common','highest', 'does', 'divide', 'divides'
               'composite', 'number','multiple','lowest', 'prime', 'factors',
               'digit', 'thousands', 'units', 'round', 'two', 'decimal', 'places'
               'by','lowest','denominator', 'ten', 'millions','tens','four', 'decimal'
               'million', 'factor','factors','one','hundred', 'rounded', 
               'rearrange', 'collect', 'expand','assumming', 
               'positive', 'negative', 'give', 'terms', 
               'letters', 'picked', 'without', 'replacement', 'from', 'prob', 'picking',
               'sequence','when', 'form', 'be', 'assuming', 'p','express','as']
    
    mathOn = False
    for i in range(0,len(words)):
       item = words[i].lower()
       punc = ""
       if item[-1] in ['.',',','?']:
           punc = item[-1]
           item = item[:-1]
           words[i] = words[i][:-1]
       if item not in testList and not mathOn:
           words[i] = "\(" + words[i]
           mathOn = True 
       if (item in testList) and mathOn:
           words[i - 1] =  words[i - 1] + '\)'
           mathOn = False
       words[i] += punc
    if(mathOn):
        words[i] = words[i] +'\)'         
    newQuestion = ""
    for word in words:
       newQuestion += word + ' '
    
    newQuestion = newQuestion.replace("\\left(", " \\left( ")
    newQuestion = newQuestion.replace("\\right)", " \\right) ")
    newQuestion = newQuestion.replace(".\\)", "\\).")
    newQuestion = newQuestion.replace(",\\)", "\\),")
    newQuestion = newQuestion.replace("?\\)", "\\)?")
    
    newQuestion = newQuestion.replace("*", "\cdot ")    
    return newQuestion[:-1]


returnString = Parser(sys.argv[1])
print(returnString)
sys.stdout.flush()