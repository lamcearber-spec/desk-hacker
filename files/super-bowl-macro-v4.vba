' ============================================
' SUPER BOWL PREDICTION GAME - VBA MACRO v4
' ============================================
' 
' YOUR FILE LAYOUT:
' Column A = Row numbers
' Column B = Questions  
' Column C = HIDDEN (correct answers - skip this!)
' Column D = Employee Predictions
' Column E = Confidence (1-5)
' D1:E1 = Merged cell with Employee Name
'
' SCOREBOARD LAYOUT:
' A = Rank
' B = Employee
' C = Correct Answers
' D = Total Score
'
' ============================================

Option Explicit

Sub CalculateScores()
    
    Dim wb As Workbook
    Dim wsResults As Worksheet
    Dim wsOutput As Worksheet
    Dim wsProcessed As Worksheet
    Dim predictionFile As String
    Dim predWb As Workbook
    Dim predWs As Worksheet
    Dim folderPath As String
    Dim employeeName As String
    Dim outputRow As Long
    Dim filesProcessed As Long
    Dim filesSkipped As Long
    Dim filesNew As Long
    
    Application.ScreenUpdating = False
    Application.DisplayAlerts = False
    
    Set wb = ThisWorkbook
    
    On Error Resume Next
    Set wsResults = wb.Sheets("ActualResults")
    Set wsOutput = wb.Sheets("Scoreboard")
    Set wsProcessed = wb.Sheets("_ProcessedFiles")
    On Error GoTo 0
    
    If wsResults Is Nothing Or wsOutput Is Nothing Or wsProcessed Is Nothing Then
        MsgBox "Please run 'SetupEverything' first!", vbExclamation
        Exit Sub
    End If
    
    folderPath = GetPredictionsFolder()
    If folderPath = "" Then Exit Sub
    
    outputRow = wsOutput.Cells(wsOutput.Rows.Count, "B").End(xlUp).Row + 1
    If outputRow < 3 Then outputRow = 3
    
    filesProcessed = 0
    filesSkipped = 0
    filesNew = 0
    
    predictionFile = Dir(folderPath & "*.xls*")
    
    Do While predictionFile <> ""
        
        ' Skip master workbook and any file with "master" or "scoreboard" in name
        If LCase(predictionFile) <> LCase(wb.Name) And _
           InStr(LCase(predictionFile), "master") = 0 And _
           InStr(LCase(predictionFile), "scoreboard") = 0 And _
           InStr(LCase(predictionFile), "results") = 0 And _
           InStr(LCase(predictionFile), "aggregat") = 0 Then
            
            If IsFileAlreadyProcessed(wsProcessed, predictionFile) Then
                filesSkipped = filesSkipped + 1
            Else
                On Error Resume Next
                Set predWb = Workbooks.Open(folderPath & predictionFile, ReadOnly:=True)
                On Error GoTo 0
                
                If Not predWb Is Nothing Then
                    Set predWs = predWb.Sheets(1)
                    
                    ' Get employee name from D1 (merged D1:E1)
                    employeeName = GetEmployeeName(predWs, predictionFile)
                    
                    Dim existingRow As Long
                    existingRow = FindEmployeeRow(wsOutput, employeeName)
                    
                    If existingRow > 0 Then
                        WriteEmployeeScore wsOutput, existingRow, employeeName, predWs, wsResults
                    Else
                        WriteEmployeeScore wsOutput, outputRow, employeeName, predWs, wsResults
                        outputRow = outputRow + 1
                    End If
                    
                    MarkFileProcessed wsProcessed, predictionFile
                    predWb.Close SaveChanges:=False
                    filesNew = filesNew + 1
                End If
            End If
            
            filesProcessed = filesProcessed + 1
        End If
        
        predictionFile = Dir()
    Loop
    
    SortScoreboard wsOutput
    UpdateRanks wsOutput
    FormatScoreboard wsOutput
    
    ' Switch to Scoreboard sheet
    wsOutput.Activate
    wsOutput.Range("A1").Select
    
    Application.ScreenUpdating = True
    Application.DisplayAlerts = True
    
    Dim msg As String
    msg = "Done!" & vbNewLine & vbNewLine
    msg = msg & "Files found: " & filesProcessed & vbNewLine
    msg = msg & "New files added: " & filesNew & vbNewLine
    msg = msg & "Already processed: " & filesSkipped
    
    MsgBox msg, vbInformation, "Super Bowl Predictions"
    
End Sub

Sub SetupEverything()
    
    Dim wb As Workbook
    Dim ws As Worksheet
    
    Set wb = ThisWorkbook
    
    ' ---- ACTUAL RESULTS SHEET ----
    On Error Resume Next
    Set ws = wb.Sheets("ActualResults")
    On Error GoTo 0
    
    If ws Is Nothing Then
        Set ws = wb.Sheets.Add(After:=wb.Sheets(wb.Sheets.Count))
        ws.Name = "ActualResults"
    End If
    
    With ws
        .Cells.Clear
        .Range("A1").Value = "ACTUAL RESULTS - Fill in Column C after the game!"
        .Range("A1").Font.Bold = True
        .Range("A1").Font.Size = 14
        .Range("A1").Font.Color = RGB(255, 0, 0)
        
        .Range("A3").Value = "#"
        .Range("B3").Value = "Question"
        .Range("C3").Value = "Actual Result"
        .Range("A3:C3").Font.Bold = True
        .Range("A3:C3").Interior.Color = RGB(0, 100, 0)
        .Range("A3:C3").Font.Color = RGB(255, 255, 255)
        
        ' Sample - CHANGE THESE TO MATCH YOUR PREDICTION FILES COLUMN B
        .Range("A4").Value = 1
        .Range("B4").Value = "Winner"
        .Range("A5").Value = 2
        .Range("B5").Value = "Winning Team Score"
        .Range("A6").Value = 3
        .Range("B6").Value = "Losing Team Score"
        .Range("A7").Value = 4
        .Range("B7").Value = "Total Points"
        .Range("A8").Value = 5
        .Range("B8").Value = "MVP"
        
        .Range("C4:C20").Interior.Color = RGB(255, 255, 200)
        .Columns("A:C").AutoFit
        .Columns("B").ColumnWidth = 30
        .Columns("C").ColumnWidth = 25
    End With
    
    ' ---- SCOREBOARD SHEET ----
    On Error Resume Next
    Set ws = wb.Sheets("Scoreboard")
    On Error GoTo 0
    
    If ws Is Nothing Then
        Set ws = wb.Sheets.Add(After:=wb.Sheets(wb.Sheets.Count))
        ws.Name = "Scoreboard"
    End If
    
    With ws
        .Cells.Clear
        .Range("A1").Value = "SUPER BOWL PREDICTION SCOREBOARD"
        .Range("A1").Font.Bold = True
        .Range("A1").Font.Size = 16
        
        ' NEW LAYOUT: Rank, Employee, Correct Answers, Total Score
        .Range("A2").Value = "Rank"
        .Range("B2").Value = "Employee"
        .Range("C2").Value = "Correct Answers"
        .Range("D2").Value = "Total Score"
        .Range("A2:D2").Font.Bold = True
        .Range("A2:D2").Interior.Color = RGB(0, 100, 0)
        .Range("A2:D2").Font.Color = RGB(255, 255, 255)
        
        .Columns("A:D").AutoFit
        .Columns("B").ColumnWidth = 25
        .Columns("C").ColumnWidth = 15
        .Columns("D").ColumnWidth = 12
    End With
    
    ' ---- PROCESSED FILES SHEET ----
    On Error Resume Next
    Set ws = wb.Sheets("_ProcessedFiles")
    On Error GoTo 0
    
    If ws Is Nothing Then
        Set ws = wb.Sheets.Add(After:=wb.Sheets(wb.Sheets.Count))
        ws.Name = "_ProcessedFiles"
    End If
    
    With ws
        .Cells.Clear
        .Range("A1").Value = "Processed Files (DO NOT EDIT)"
        .Range("A1").Font.Bold = True
        .Visible = xlSheetHidden
    End With
    
    MsgBox "Setup complete!" & vbNewLine & vbNewLine & _
           "IMPORTANT: Edit 'ActualResults' sheet Column B" & vbNewLine & _
           "to match the questions in your prediction files!", _
           vbInformation, "Setup Complete"
    
End Sub

Sub ResetEverything()
    Dim answer As VbMsgBoxResult
    answer = MsgBox("This will clear all scores! Are you sure?", vbYesNo + vbExclamation)
    
    If answer = vbYes Then
        On Error Resume Next
        ThisWorkbook.Sheets("Scoreboard").Range("A3:D1000").Clear
        ThisWorkbook.Sheets("_ProcessedFiles").Range("A2:A1000").Clear
        On Error GoTo 0
        MsgBox "Reset complete!", vbInformation
    End If
End Sub

' ============================================
' HELPER FUNCTIONS
' ============================================

Function GetPredictionsFolder() As String
    Dim fd As FileDialog
    Set fd = Application.FileDialog(msoFileDialogFolderPicker)
    fd.Title = "Select folder with prediction files"
    
    If fd.Show = -1 Then
        GetPredictionsFolder = fd.SelectedItems(1)
        If Right(GetPredictionsFolder, 1) <> "\" Then
            GetPredictionsFolder = GetPredictionsFolder & "\"
        End If
    Else
        GetPredictionsFolder = ""
    End If
End Function

Function IsFileAlreadyProcessed(ws As Worksheet, fileName As String) As Boolean
    Dim cell As Range
    Dim lastRow As Long
    
    lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
    
    For Each cell In ws.Range("A2:A" & lastRow)
        If LCase(cell.Value) = LCase(fileName) Then
            IsFileAlreadyProcessed = True
            Exit Function
        End If
    Next cell
    
    IsFileAlreadyProcessed = False
End Function

Sub MarkFileProcessed(ws As Worksheet, fileName As String)
    Dim nextRow As Long
    nextRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 1
    If nextRow < 2 Then nextRow = 2
    ws.Cells(nextRow, 1).Value = fileName
End Sub

Function GetEmployeeName(ws As Worksheet, fileName As String) As String
    Dim name As String
    
    ' YOUR FORMAT: Employee name in merged cell D1:E1
    name = Trim(ws.Range("D1").Value)
    
    ' If empty or looks wrong, try other locations
    If name = "" Or LCase(name) = "name" Or LCase(name) = "employee" Or Len(name) < 2 Then
        name = Trim(ws.Range("E1").Value)
    End If
    If name = "" Or LCase(name) = "name" Or Len(name) < 2 Then
        name = Trim(ws.Range("D2").Value)
    End If
    If name = "" Or LCase(name) = "name" Or Len(name) < 2 Then
        name = Trim(ws.Range("B1").Value)
    End If
    
    ' Last resort: use filename
    If name = "" Or Len(name) < 2 Or IsNumeric(name) Then
        name = fileName
        If InStr(name, ".") > 0 Then
            name = Left(name, InStrRev(name, ".") - 1)
        End If
        name = Replace(Replace(name, "_", " "), "-", " ")
    End If
    
    GetEmployeeName = name
End Function

Function FindEmployeeRow(ws As Worksheet, employeeName As String) As Long
    Dim cell As Range
    Dim lastRow As Long
    
    lastRow = ws.Cells(ws.Rows.Count, "B").End(xlUp).Row
    
    For Each cell In ws.Range("B3:B" & lastRow)
        If LCase(Trim(cell.Value)) = LCase(Trim(employeeName)) Then
            FindEmployeeRow = cell.Row
            Exit Function
        End If
    Next cell
    
    FindEmployeeRow = 0
End Function

Sub WriteEmployeeScore(wsOutput As Worksheet, outputRow As Long, employeeName As String, predWs As Worksheet, wsResults As Worksheet)
    
    Dim totalScore As Long
    Dim correctCount As Long
    
    Dim predRow As Long
    Dim lastPredRow As Long
    Dim question As String
    Dim prediction As String
    Dim confidence As Long
    Dim actualResult As String
    
    totalScore = 0
    correctCount = 0
    
    lastPredRow = predWs.Cells(predWs.Rows.Count, "B").End(xlUp).Row
    
    ' YOUR FORMAT: A=Row#, B=Question, C=Hidden(skip), D=Prediction, E=Confidence
    For predRow = 2 To lastPredRow
        question = CleanText(predWs.Cells(predRow, 2).Value)   ' Column B = Question
        prediction = CleanText(predWs.Cells(predRow, 4).Value) ' Column D = Prediction
        confidence = GetConfidenceValue(predWs.Cells(predRow, 5).Value) ' Column E = Confidence
        
        ' Skip headers or empty
        If question = "" Or question = "question" Or question = "category" Then GoTo NextRow
        
        ' Find matching result
        actualResult = FindActualResult(wsResults, question)
        
        If actualResult <> "" And prediction <> "" Then
            If prediction = actualResult Then
                correctCount = correctCount + 1
                totalScore = totalScore + confidence
            ElseIf IsNumeric(prediction) And IsNumeric(actualResult) Then
                If Val(prediction) = Val(actualResult) Then
                    correctCount = correctCount + 1
                    totalScore = totalScore + (confidence * 2) ' Bonus for exact numbers
                End If
            ElseIf Len(prediction) >= 3 And Len(actualResult) >= 3 Then
                If InStr(actualResult, prediction) > 0 Or InStr(prediction, actualResult) > 0 Then
                    totalScore = totalScore + Int(confidence / 2) ' Partial match
                End If
            End If
        End If
        
NextRow:
    Next predRow
    
    ' Write to scoreboard - NEW LAYOUT: Rank, Employee, Correct Answers, Total Score
    wsOutput.Cells(outputRow, 1).Value = ""           ' Rank (filled later)
    wsOutput.Cells(outputRow, 2).Value = employeeName ' Employee
    wsOutput.Cells(outputRow, 3).Value = correctCount ' Correct Answers
    wsOutput.Cells(outputRow, 4).Value = totalScore   ' Total Score
    
End Sub

Function CleanText(val As Variant) As String
    CleanText = LCase(Trim(CStr(val)))
End Function

Function GetConfidenceValue(val As Variant) As Long
    Dim conf As Long
    If IsNumeric(val) Then
        conf = CLng(val)
        If conf < 1 Then conf = 1
        If conf > 5 Then conf = 5
    Else
        conf = 1
    End If
    GetConfidenceValue = conf
End Function

Function FindActualResult(wsResults As Worksheet, question As String) As String
    Dim cell As Range
    Dim lastRow As Long
    
    lastRow = wsResults.Cells(wsResults.Rows.Count, "B").End(xlUp).Row
    
    ' ActualResults: Column B = Questions, Column C = Results
    For Each cell In wsResults.Range("B4:B" & lastRow)
        If CleanText(cell.Value) = question Then
            FindActualResult = CleanText(cell.Offset(0, 1).Value)
            Exit Function
        End If
    Next cell
    
    ' Try partial match
    For Each cell In wsResults.Range("B4:B" & lastRow)
        If InStr(CleanText(cell.Value), question) > 0 Or InStr(question, CleanText(cell.Value)) > 0 Then
            FindActualResult = CleanText(cell.Offset(0, 1).Value)
            Exit Function
        End If
    Next cell
    
    FindActualResult = ""
End Function

Sub SortScoreboard(ws As Worksheet)
    Dim lastRow As Long
    lastRow = ws.Cells(ws.Rows.Count, "B").End(xlUp).Row
    
    If lastRow > 2 Then
        ' Sort by Total Score (Column D) descending
        ws.Range("A2:D" & lastRow).Sort Key1:=ws.Range("D3"), Order1:=xlDescending, Header:=xlYes
    End If
End Sub

Sub UpdateRanks(ws As Worksheet)
    Dim lastRow As Long, i As Long
    lastRow = ws.Cells(ws.Rows.Count, "B").End(xlUp).Row
    
    For i = 3 To lastRow
        ws.Cells(i, 1).Value = i - 2
    Next i
End Sub

Sub FormatScoreboard(ws As Worksheet)
    Dim lastRow As Long
    lastRow = ws.Cells(ws.Rows.Count, "B").End(xlUp).Row
    
    ' Clear all previous formatting from data rows
    If lastRow >= 3 Then
        ws.Range("A3:D" & lastRow).Interior.ColorIndex = xlNone
    End If
    
    ' Apply medal colors to top 3
    If lastRow >= 3 Then ws.Range("A3:D3").Interior.Color = RGB(255, 215, 0)   ' Gold
    If lastRow >= 4 Then ws.Range("A4:D4").Interior.Color = RGB(192, 192, 192) ' Silver
    If lastRow >= 5 Then ws.Range("A5:D5").Interior.Color = RGB(205, 127, 50)  ' Bronze
    
    ' Add alternating row colors for rows 6 onwards
    Dim i As Long
    For i = 6 To lastRow
        If i Mod 2 = 0 Then
            ws.Range("A" & i & ":D" & i).Interior.Color = RGB(240, 240, 240) ' Light gray
        Else
            ws.Range("A" & i & ":D" & i).Interior.Color = RGB(255, 255, 255) ' White
        End If
    Next i
    
    ' Add borders to the entire table
    If lastRow >= 3 Then
        With ws.Range("A2:D" & lastRow).Borders
            .LineStyle = xlContinuous
            .Weight = xlThin
            .Color = RGB(200, 200, 200)
        End With
    End If
    
    ' Auto-fit columns
    ws.Columns("A:D").AutoFit
    ws.Columns("B").ColumnWidth = 25
End Sub
