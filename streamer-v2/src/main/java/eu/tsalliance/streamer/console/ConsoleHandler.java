package eu.tsalliance.streamer.console;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Scanner;

public class ConsoleHandler extends Thread {
    private static final Logger logger = LoggerFactory.getLogger(ConsoleHandler.class);
    private static ConsoleHandler instance;

    public ConsoleHandler(){
        super("console");
    }

    @Override
    public void run() {
        try {
            while(true) {
                Scanner scanner = new Scanner(System.in);
                String input = scanner.nextLine();

                if(input != null) {
                    CommandHandler.handleCommand(input);
                }
            }
        } catch (NullPointerException exception) {
            logger.error("A fatal error has occured. This means, that console input may not be possible.");
        }
    }

    public static ConsoleHandler newInstance() {
        if(instance != null) {
            instance.interrupt();
            try {
                instance.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        instance = new ConsoleHandler();
        return instance;
    }

    public static ConsoleHandler getInstance() {
        if(instance == null) instance = newInstance();
        return instance;
    }
}
