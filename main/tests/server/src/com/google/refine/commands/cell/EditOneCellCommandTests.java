package com.google.refine.commands.cell;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.testng.Assert.assertEquals;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import com.google.refine.RefineTest;
import com.google.refine.commands.Command;
import com.google.refine.model.Project;
import com.google.refine.util.TestUtils;

public class EditOneCellCommandTests extends RefineTest {
	
	protected Project project = null;
	protected HttpServletRequest request = null;
    protected HttpServletResponse response = null;
    protected Command command = null;
    protected StringWriter writer = null;
	
	@BeforeMethod
	public void setUpProject() {
		project = createCSVProject(
				"first_column,second_column\n"
				+ "a,b\n"
				+ "c,d\n");
		command = new EditOneCellCommand();
		request = mock(HttpServletRequest.class);
		response = mock(HttpServletResponse.class);
		writer = new StringWriter();
		try {
            when(response.getWriter()).thenReturn(new PrintWriter(writer));
        } catch (IOException e) {
            e.printStackTrace();
        }
	}
	
	@Test
	public void testEditOneCell() throws ServletException, IOException {
		when(request.getParameter("project")).thenReturn(Long.toString(project.id));
		when(request.getParameter("row")).thenReturn("1");
		when(request.getParameter("cell")).thenReturn("0");
		when(request.getParameter("type")).thenReturn("string");
		when(request.getParameter("value")).thenReturn("e");
		when(request.getParameter("csrf_token")).thenReturn(Command.csrfFactory.getFreshToken());
		
		command.doPost(request, response);
		
		assertEquals("a", project.rows.get(0).cells.get(0).value);
		assertEquals("b", project.rows.get(0).cells.get(1).value);
		assertEquals("e", project.rows.get(1).cells.get(0).value);
		assertEquals("d", project.rows.get(1).cells.get(1).value);
	}
	
	@Test
	public void testMissingCSRFToken() throws ServletException, IOException {
		when(request.getParameter("project")).thenReturn(Long.toString(project.id));
		when(request.getParameter("row")).thenReturn("1");
		when(request.getParameter("cell")).thenReturn("0");
		when(request.getParameter("type")).thenReturn("string");
		when(request.getParameter("value")).thenReturn("e");
		
		command.doPost(request, response);
		
		assertEquals("c", project.rows.get(1).cells.get(0).value);
		TestUtils.assertEqualAsJson("{\"code\":\"error\",\"message\":\"Missing or invalid csrf_token parameter\"}", writer.toString());
	}
}
